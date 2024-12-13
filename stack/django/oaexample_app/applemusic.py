import os
from datetime import datetime, timedelta

import jwt
import requests
from django.conf import settings
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Playlists, Songs, AppTokens
from .serializers import PlaylistsSerializer, SongsSerializer

# Apple Music API credentials
APPLE_TEAM_ID = os.environ.get("APPLE_TEAM_ID")
APPLE_KEY_ID = os.environ.get("APPLE_KEY_ID")
APPLE_PRIVATE_KEY = os.environ.get("APPLE_KEY")

def generate_apple_music_token():
    headers = {
        "alg": "ES256",
        "kid": APPLE_KEY_ID
    }
    payload = {
        "iss": APPLE_TEAM_ID,
        "iat": int(datetime.now().timestamp()),
        "exp": int((datetime.now() + timedelta(hours=12)).timestamp())
    }
    token = jwt.encode(payload, APPLE_PRIVATE_KEY, algorithm="ES256", headers=headers)
    return token


class AppleMusicViewSet(viewsets.ViewSet):

    def get_apple_music_client(self, user):
        try:
            app_token = AppTokens.objects.get(user=user, provider='applemusic')

            # Check if the token is expired
            if app_token.expires_at <= timezone.now():
                return None  # For Apple Music, token expiration is not common for developer tokens

            return app_token.token  # Return the valid token

        except AppTokens.DoesNotExist:
            return None

    def search_apple_music(self, token, query):
        url = f"https://api.music.apple.com/v1/catalog/us/search"
        headers = {
            'Authorization': f'Bearer {settings.APPLE_DEVELOPER_TOKEN}',
        }
        if token is not None:
            headers['Music-User-Token'] = token

        params = {
            'term': query,
            'limit': 25,
            'types': 'songs,albums,artists'
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()

    @extend_schema(
        parameters=[
            OpenApiParameter(name='q', description='Search query', required=False, type=str),
        ],
        responses={200: 'Search Tracks, Artists, and Albums on Apple Music'},
    )
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', None)
        if not query:
            return Response({'error': 'Query parameter `q` is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = self.get_user(request)
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)

#        token = self.get_apple_music_client(user)
#        if not token:
#            return Response({'error': 'Apple Music token not found or expired.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            results = self.search_apple_music(None, query)
            return Response(results, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='store-token')
    def store_token(self, request):
        user = request.user
        if not user:
            return Response({'error': 'User not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)

        token = request.data.get('token')
        if not token:
            return Response({'error': 'MusicKit token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            apptoken, created = AppTokens.objects.get_or_create(
                author=user,
                token = token,
                provider='applemusic'
            )

            if not created:
                apptoken.save()

            return Response({'detail': 'MusicKit token and user ID stored successfully.'},
                            status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        parameters=[
            OpenApiParameter(name='token', description='MusicKit Auth Token', required=False, type=str),
        ],
        responses={200: 'Sync playlists from your Apple Music account'},
    )
    @action(detail=False, methods=['post'], url_path='playlists/sync')
    def sync_playlists(self, request):
        if not request.user:
            return Response({'error': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)

        token = request.data.get('token')
        if not token:
            return Response({'error': 'MusicKit token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        resp = {
            "count": 0,
            "next": None,
            "previous": None,
            "results": []
        }


        try:
            # Make a request to the Apple Music API to get the user's playlists
            headers = {
                'Authorization': f'Bearer {settings.APPLE_DEVELOPER_TOKEN}',
                'Music-User-Token': token
            }
            v1Url = "https://api.music.apple.com/v1"

            pids = request.data['pids']
            if pids is None:
                return Response({'error': 'Which playlists do you want to add?'}, status=status.HTTP_400_BAD_REQUEST)

            event_id = request.data['event_id']
            if event_id is None:
                return Response({'error': 'Which Event is this for?'}, status=status.HTTP_400_BAD_REQUEST)

            for pid in pids:
                playlist_response = requests.get(f'{v1Url}/me/library/playlists/{pid}', headers=headers)
                if playlist_response is None:
                    return Response({'error': f'Invalid Playlist ID {pid}'}, status=status.HTTP_400_BAD_REQUEST)
                playlist_response = playlist_response.json()['data'][0]

                playlist_data = {
                    'name': playlist_response['attributes']['name'],
                    'social_source': 'apple',
                    'social_id': playlist_response['id'],
                    'author': request.user.id,
                    'playing_now': False,
                    'event': event_id
                }
                if 'artwork' in playlist_response['attributes'] and playlist_response['attributes']['artwork'] is not None:
                     playlist_data['remote_image'] = playlist_response['attributes']['artwork']['url'].replace("{w}x{h}", "200x200")

                playlist_instance = Playlists.objects.filter(
                    social_id=playlist_data['social_id'],
                    author=request.user.id,
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
                    relEntity = {
                        "id": playlist_instance.id,
                        "str": playlist_instance.name,
                        "_type": playlist_instance.__class__.__name__,
                        "songs": []
                    }

                    track_list = requests.get(f'{v1Url}/me/library/playlists/{pid}/tracks?limit=100&offset=0', headers=headers)
                    track_list = track_list.json()

                    if "data" in track_list and len(track_list) > 0:
                        for track in track_list['data']:
                            song_data = {
                                "apple_id": track['id'],
                                "playlist": playlist_instance.id,
                                "author": request.user.id,
                                "name": track['attributes']['name'],
                                "artist": track['attributes']['artistName']
                            }

                            if 'artwork' in track['attributes'] and track['attributes'][
                                'artwork'] is not None:
                                track['remote_image'] = track['attributes']['artwork'][
                                    'url'].replace("{w}x{h}", "200x200")

                            song_instance = Songs.objects.filter(
                                name=song_data['name'],
                                author=request.user.id
                            ).first()

                            if song_instance:
                                # WARN: probably can skip this to optimize
                                song_serializer  = SongsSerializer(song_instance, data=song_data, partial=True)
                            else:
                                song_serializer  = SongsSerializer(data=song_data)

                            if song_serializer.is_valid():
                                song_instance = song_serializer.save()  # Save song instance
                                relEntity["songs"].append(SongsSerializer(song_instance).data)  # Now we can access serializer.data

                    resp["count"] += 1
                    resp["results"].append(relEntity)


                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response(resp, status=status.HTTP_200_OK)


        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
