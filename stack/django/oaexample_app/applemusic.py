import os
from datetime import datetime, timedelta

import jwt
import requests
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

# http://localhost:8000/connectors/apple/playlists/?name=chill


# Apple Music API credentials
APPLE_TEAM_ID = os.environ.get("APPLE_TEAM_ID")
APPLE_KEY_ID = os.environ.get("APPLE_KEY_ID")
APPLE_PRIVATE_KEY = os.environ.get("APPLE_KEY")


"""
# TODO: needed endpoints:

- a user's top 10 artists
- a user's top 10 playlists
- search any song 

"""

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

@api_view(['GET'])
def apple_music_playlists(request):
    playlist_name = request.query_params.get('name')

    if not playlist_name:
        return Response({'error': 'Playlist name is required'}, status=status.HTTP_400_BAD_REQUEST)

    token = generate_apple_music_token()

    headers = {
        'Authorization': f'Bearer {token}',
        'Music-User-Token': 'your_music_user_token'
    }

    url = f'https://api.music.apple.com/v1/catalog/us/search?term={playlist_name}&types=playlists'

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        result = response.json()
        return Response(result)
    except requests.exceptions.RequestException as e:
        print(f'Error searching Apple Music playlists: {e}')
        return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
