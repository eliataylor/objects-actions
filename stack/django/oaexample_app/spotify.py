import spotipy
from allauth.socialaccount.models import SocialToken, SocialAccount
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from spotipy.oauth2 import SpotifyOAuth, SpotifyClientCredentials
import requests
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from .models import Playlists, Songs
from .serializers import PlaylistsSerializer, SongsSerializer
from .views import LimitedLimitOffsetPagination


class SpotifyViewSet(viewsets.ViewSet):

    def get_spotify_client(self, user):
        try:
            social_account = SocialAccount.objects.get(user=user, provider='spotify')
            social_token = SocialToken.objects.get(account=social_account)

            # Check if the token is expired
            if social_token.expires_at <= timezone.now():
                # Get the SocialApp for Spotify
                # social_app = SocialApp.objects.get(provider='spotify')
                social_app = settings.SOCIALACCOUNT_PROVIDERS['spotify']['APP']

                # Create a SpotifyOAuth object
                sp_oauth = SpotifyOAuth(
                    client_id=social_app['client_id'],
                    client_secret=social_app['secret'],
                    redirect_uri=social_app['callback_url'], # hardcoded in settings (not available in db)
                )

                # Refresh the token
                token_info = sp_oauth.refresh_access_token(social_token.token_secret)

                # Update the SocialToken with the new token info
                social_token.token = token_info['access_token']
                social_token.expires_at = timezone.now() + timezone.timedelta(seconds=token_info['expires_in'])
                social_token.save()

            # Create a Spotipy client with the valid token
            sp = spotipy.Spotify(auth=social_token.token)
            return sp

        except SocialAccount.DoesNotExist:
            return None
        except SocialToken.DoesNotExist:
            return None

    def get_user(self, request):
        User = get_user_model()
        user_id = request.query_params.get('user_id')

        if user_id:
            try:
                return User.objects.get(id=user_id)
            except User.DoesNotExist:
                return None
        return request.user

    @extend_schema(
        parameters=[
            OpenApiParameter(name='q', description='Search query', required=False, type=str),
        ],
        responses={200: 'Search Tracks, Artists and Albums'},
    )
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', None)
        if not query:
            return Response({'error': 'Query parameter `q` is required.'}, status=status.HTTP_400_BAD_REQUEST)

        social_app = settings.SOCIALACCOUNT_PROVIDERS['spotify']['APP']
        client_credentials_manager = SpotifyClientCredentials(
            client_id=social_app['client_id'],
            client_secret=social_app['secret'],
        )

        sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

        try:
            results = sp.search(q=query, type='track')
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        parameters=[
            OpenApiParameter(name='user_id', description='Optional user ID', required=False, type=int),
        ]
    )
    @action(detail=False, methods=['get'])
    def top_artists(self, request):
        user = self.get_user(request)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)

        sp = self.get_spotify_client(user)
        if not sp:
            return Response({'error': 'No Spotify account found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            results = sp.current_user_top_artists(limit=10)
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'pids': {
                        'type': 'array',
                        'items': {'type': 'integer'},
                        'description': 'List of PIDs'
                    }
                },
                'required': ['pids'],  # Remove this line if `pids` is optional
            }
        },
        examples=[
            OpenApiExample(
                'Example 1',
                value={'pids': [1, 2, 3]},
                description='An example request with a list of PIDs'
            )
        ],
        parameters=[
            OpenApiParameter(
                name='user_id',
                description='Optional user ID',
                required=False,
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name='event_id',
                description='Event ID',
                required=True,
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY
            )
        ],
        responses={200: 'Success'}  # Adjust according to your actual response schema
    )

    def download_image(self, image_url, tmp_name):
        try:
            response = requests.get(image_url, stream=True)
            if response.status_code == 200:
                image_file = ContentFile(response.content, name=tmp_name)
                # default_storage.save(tmp_name, ContentFile(response.content))
                return image_file
        except requests.RequestException as e:
            print(f"Failed to download image for playlist {tmp_name}: {e}")
        return None

    @action(detail=False, methods=['post'], url_path='playlists/sync')
    def sync_playlists(self, request):
        user = self.get_user(request)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)

        sp = self.get_spotify_client(user)

        resp = {
            "count": 0,
            "next": None,
            "previous": None,
            "results": []
        }

        if not sp:
            return Response({'error': 'No Spotify account found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pids = request.data['pids']
            if pids is None:
                return Response({'error': 'Which playlists do you want to add?'}, status=status.HTTP_400_BAD_REQUEST)

            event_id = request.data['event_id']
            if event_id is None:
                return Response({'error': 'Which Event is this for?'}, status=status.HTTP_400_BAD_REQUEST)

            for pid in pids:
                spotify_playlist = sp.playlist(pid) # control fields
                if spotify_playlist is None:
                    return Response({'error': f'Invalid Playlist ID {pid}'}, status=status.HTTP_400_BAD_REQUEST)

                playlist_data = {
                    'name': spotify_playlist['name'],
                    'social_source': 'spotify',
                    'social_id': spotify_playlist['id'],
                    'author': user.id,
                    'playing_now': False,
                    'event': event_id
                }

                # Download and save the image
                if spotify_playlist['images']:
                    playlist_data['remote_image'] = spotify_playlist['images'][0]['url']
                    playlist_data['image'] = self.download_image(playlist_data['remote_image'], f"spotify-playlist-{spotify_playlist['id']}.jpg")


                playlist_instance = Playlists.objects.filter(
                    social_id=playlist_data['social_id'],
                    author=user.id,
                    social_source=playlist_data['social_source']
                ).first()

                if playlist_instance:
                    serializer = PlaylistsSerializer(playlist_instance, data=playlist_data, partial=True)
                else:
                    serializer = PlaylistsSerializer(data=playlist_data)

                if serializer.is_valid():
                    if not playlist_instance:
                        playlist_instance = serializer.save()
                    else:
                        serializer.save()

                    toReturn = {
                        "id": playlist_instance.id,
                        "str": playlist_instance.name,
                        "_type": playlist_instance.__class__.__name__,
                        "songs":[]
                    }

                    track_list = sp.playlist_items(pid, limit=10)  # control fields
                    while track_list and len(track_list) > 0 and "items" in track_list:
                        for result in track_list['items']:
                            track = result['track']
                            song_data = {
                                "spotify_id": track['id'],
                                "playlist": playlist_instance.id,
                                "author":user.id,
                                "name": track['name'],
                                "artist": [artist.get('name') for artist in track.get('artists', [])],
                                "remote_image": track.get('album', {}).get('images', [{}])[0].get('url')
                            }

                            song_data['artist'] = ", ".join(song_data['artist'])

                            if song_data['remote_image'] is None and "images" in track['album']:
                                song_data['remote_image'] = track['album']['images'][0]['url']

                            if song_data['remote_image'] :
                                song_data['cover'] = self.download_image(song_data['remote_image'], f"spotify-song-{song_data['spotify_id']}.jpg")

                            song_instance = Songs.objects.filter(
                                name=song_data['name'],
                                author=user.id
                            ).first()

                            if song_instance:
                                serializer = SongsSerializer(song_instance, data=song_data, partial=True)
                            else:
                                serializer = SongsSerializer(data=song_data)

                            if serializer.is_valid():
                                serializer.save()
                                toReturn["songs"].append(song_data['name'])

                                # TODO: once total songs imported > 100, end.

                        track_list = sp.next(track_list)

                    resp["results"].append(toReturn)


                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response(resp, status=status.HTTP_200_OK)


        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        parameters=[
            OpenApiParameter(name='user_id', description='Optional user ID', required=False, type=int),
        ]
    )
    @action(detail=False, methods=['get'], url_path='playlists')
    def playlists(self, request):
        user = self.get_user(request)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)

        sp = self.get_spotify_client(user)

        if not sp:
            return Response({'error': 'No Spotify account found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            paginator = LimitedLimitOffsetPagination()
            sp_paginated = sp.current_user_playlists(limit=paginator.get_limit(request), offset=paginator.get_offset(request))

            paginated = {
                'count': sp_paginated['total'],
                'limit': sp_paginated['limit'],
                'offset': sp_paginated['offset'],
                'results': []
            }

            for item in sp_paginated['items']:
                playlist_data = {
                    'social_source': 'spotify',
                    "id": item['id'],
                    'name': item['name'],
                    'remote_image': item['images'][0]['url'] if item['images'] else None,
                    "tracks_count": item['tracks']['total'],
                    "collaborative": item['collaborative'],
                    "_type":'SocialPlaylists'
                }

                """
                playlist_instance = Playlists.objects.filter(
                    name=playlist_data['name'],
                    author=user.id,
                    social_source=playlist_data['social_source']
                ).first()

                if playlist_instance:
                    playlist_data['playlist'] = {
                        "id": playlist_instance.id,
                        "str": playlist_instance.name,
                        "_type": playlist_instance.__class__.__name__,
                    }
                """

                paginated['results'].append(playlist_data)

            return Response(paginated, status=status.HTTP_200_OK)


        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        parameters=[
            OpenApiParameter(name='user_id', description='Optional user ID', required=False, type=int),
            OpenApiParameter(name='playlist_id', description='Playlist ID', required=True, type=str),
        ]
    )
    @action(detail=False, methods=['get'])
    def playlist_items(self, request):
        user = request.user
        sp = self.get_spotify_client(user)
        if not sp:
            return Response({'error': 'No Spotify account found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            playlists = sp.playlist_items(limit=10)
            return Response(playlists, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
