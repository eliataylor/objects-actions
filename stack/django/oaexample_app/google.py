import json
import os

import requests
from drf_spectacular.utils import extend_schema, OpenApiExample
from rest_framework import permissions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


def get_location_from_ip(ip_address):
    if ip_address == '127.0.0.1':
        return {
            'circle': {
                'center': {  # SF, CA
                    'latitude': 34.0522,
                    'longitude': -118.2437,
                },
                'radius': 500.0,
            }
        }
    try:
        response = requests.get(f'https://ipinfo.io/{ip_address}/geo')
        if response.status_code == 200:
            data = response.json()
            if 'loc' in data:
                latitude, longitude = map(float, data['loc'].split(','))
                return {
                    'circle': {
                        'center': {
                            'latitude': latitude,
                            'longitude': longitude,
                        },
                        'radius': 500.0,  # Example radius, can be adjusted
                    }
                }
            else:
                print("Location data ('loc') not found in the response.")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching location from IP: {e}")
    return None


class GooglePlacesSearch(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        operation_id="relay_places_autocomplete",
        description="Relay a request to the Google Places API using the provided input and optional location bias. If locationBias is not provided, it is inferred from the IP address.",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'input': {
                        'type': 'string',
                        'description': 'Search input text'
                    },
                    'locationBias': {
                        'type': 'object',
                        'description': 'Optional location bias to influence search results',
                        'properties': {
                            'circle': {
                                'type': 'object',
                                'properties': {
                                    'center': {
                                        'type': 'object',
                                        'properties': {
                                            'latitude': {
                                                'type': 'number',
                                                'format': 'float',
                                                'description': 'Latitude of the circle center'
                                            },
                                            'longitude': {
                                                'type': 'number',
                                                'format': 'float',
                                                'description': 'Longitude of the circle center'
                                            }
                                        }
                                    },
                                    'radius': {
                                        'type': 'number',
                                        'format': 'float',
                                        'description': 'Radius in meters'
                                    }
                                }
                            }
                        }
                    }
                },
                'required': ['input']
            }
        },
        responses={
            200: OpenApiExample(
                'Successful response',
                value=[
                    {"label": "Pizza Place 1, San Francisco, CA", "value": "abc123"},
                    {"label": "Pizza Place 2, San Francisco, CA", "value": "def456"}
                ],
                response_only=True,
                status_codes=["200"]
            ),
            400: 'Bad Request',
            500: 'Server Error'
        }
    )
    def post(self, request):
        input_text = request.data.get('input', '').strip()
        location_bias = request.data.get('locationBias')

        if not input_text:
            return Response({'error': 'Missing input parameter'}, status=status.HTTP_400_BAD_REQUEST)

        if not location_bias:
            # Use the request's IP address to infer the location
            ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')
            location_bias = get_location_from_ip(ip_address)

        api_key = os.getenv("GOOGLE_PLACES_KEY", "CHANGEME")
        url = 'https://places.googleapis.com/v1/places:autocomplete'

        headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': api_key
        }

        payload = {
            'input': input_text,
            'locationBias': location_bias
        }

        try:
            external_response = requests.post(url, headers=headers, data=json.dumps(payload))

            if external_response.status_code != 200:
                return Response(
                    {'error': 'Failed to fetch data from external API'},
                    status=external_response.status_code
                )

            data = external_response.json()
            if 'suggestions' not in data:
                return Response({'error': 'No data found'}, status=status.HTTP_404_NOT_FOUND)

            results = [
                {
                    'label': suggestion.get('placePrediction').get('text').get('text'),
                    'value': suggestion.get('placePrediction').get('text').get('text')
                }
                for suggestion in data['suggestions']
            ]

            return Response(results, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Error fetching data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
