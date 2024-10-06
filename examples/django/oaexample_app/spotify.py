from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from allauth.socialaccount.models import SocialToken, SocialAccount
import spotipy
from drf_spectacular.utils import extend_schema, OpenApiParameter

class SpotifyViewSet(viewsets.ViewSet):

    def get_spotify_client(self, user):
        try:
            social_account = SocialAccount.objects.get(user=user, provider='spotify')
            social_token = SocialToken.objects.get(account=social_account)
            sp = spotipy.Spotify(auth=social_token.token)
            return sp
        except SocialAccount.DoesNotExist:
            return None
        except SocialToken.DoesNotExist:
            return None

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

        user = request.user
        sp = self.get_spotify_client(user)
        if not sp:
            return Response({'error': 'No Spotify account found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            results = sp.search(q=query, type='track,artist,album')
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def top_artists(self, request):
        user = request.user
        sp = self.get_spotify_client(user)
        if not sp:
            return Response({'error': 'No Spotify account found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            results = sp.current_user_top_artists(limit=10)
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def top_playlists(self, request):
        user = request.user
        sp = self.get_spotify_client(user)
        if not sp:
            return Response({'error': 'No Spotify account found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            playlists = sp.current_user_playlists(limit=10)
            return Response(playlists, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
