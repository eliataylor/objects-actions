####OBJECT-ACTIONS-VIEWSET-IMPORTS-STARTS####
from rest_framework import viewsets, permissions, filters, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from django.http import JsonResponse
from django.core.management import call_command
from django.apps import apps
from django.http import HttpResponse
import re
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from .models import Users
from .serializers import UsersSerializer
from .models import Songs
from .serializers import SongsSerializer
from .models import Playlists
from .serializers import PlaylistsSerializer
from .models import Events
from .serializers import EventsSerializer
from .models import Friendships
from .serializers import FriendshipsSerializer
from .models import Invites
from .serializers import InvitesSerializer
from .models import SongRequests
from .serializers import SongRequestsSerializer
from .models import EventCheckins
from .serializers import EventCheckinsSerializer
from .models import Likes
from .serializers import LikesSerializer
####OBJECT-ACTIONS-VIEWSET-IMPORTS-ENDS####

####OBJECT-ACTIONS-VIEWSETS-STARTS####
class UsersViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all().order_by('id')
    serializer_class = UsersSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name']

class SongsViewSet(viewsets.ModelViewSet):
    queryset = Songs.objects.all().order_by('id')
    serializer_class = SongsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class PlaylistsViewSet(viewsets.ModelViewSet):
    queryset = Playlists.objects.all().order_by('id')
    serializer_class = PlaylistsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class EventsViewSet(viewsets.ModelViewSet):
    queryset = Events.objects.all().order_by('id')
    serializer_class = EventsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class EventsAliasView(generics.RetrieveAPIView):
    queryset = Events.objects.all()
    serializer_class = EventsSerializer
    lookup_field = 'url_alias'
class FriendshipsViewSet(viewsets.ModelViewSet):
    queryset = Friendships.objects.all().order_by('id')
    serializer_class = FriendshipsSerializer
    permission_classes = [permissions.IsAuthenticated]

class InvitesViewSet(viewsets.ModelViewSet):
    queryset = Invites.objects.all().order_by('id')
    serializer_class = InvitesSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['event__name']

class SongRequestsViewSet(viewsets.ModelViewSet):
    queryset = SongRequests.objects.all().order_by('id')
    serializer_class = SongRequestsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['song__name', 'event__name', 'playlist__name']

class EventCheckinsViewSet(viewsets.ModelViewSet):
    queryset = EventCheckins.objects.all().order_by('id')
    serializer_class = EventCheckinsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['event__name']

class LikesViewSet(viewsets.ModelViewSet):
    queryset = Likes.objects.all().order_by('id')
    serializer_class = LikesSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['song__name', 'event__name', 'playlist__name']
####OBJECT-ACTIONS-VIEWSETS-ENDS####


####OBJECT-ACTIONS-CORE-STARTS####
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

def migrate(request):
    call_command('migrate')
    return JsonResponse({'status': 'migrations complete'})

def collectstatic(request):
    call_command('collectstatic', '--noinput')
    return JsonResponse({'status': 'static files collected'})


SEARCH_FIELDS_MAPPING = {
  "Users": [
    "first_name",
    "last_name"
  ],
  "Songs": [
    "name"
  ],
  "Playlists": [
    "name"
  ],
  "Events": [
    "name"
  ],
  "Friendships": [],
  "Invites": [
    "event__name"
  ],
  "SongRequests": [
    "song__name",
    "event__name",
    "playlist__name"
  ],
  "EventCheckins": [
    "event__name"
  ],
  "Likes": [
    "song__name",
    "event__name",
    "playlist__name"
  ]
}

SERIALZE_MODEL_MAP = { "Users": UsersSerializer,"Songs": SongsSerializer,"Playlists": PlaylistsSerializer,"Events": EventsSerializer,"Friendships": FriendshipsSerializer,"Invites": InvitesSerializer,"SongRequests": SongRequestsSerializer,"EventCheckins": EventCheckinsSerializer,"Likes": LikesSerializer }

class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id, model_name):
        # Get the model class from the model name
        try:
            model = apps.get_model('oaexample_app', model_name)
        except LookupError:
            return JsonResponse({'error': 'Model not found'}, status=404)

        # Check if the model has an 'author' field
        if not hasattr(model, 'author'):
            return JsonResponse({'error': 'Model does not have an author field'}, status=400)

        # Count the number of entities the user owns
        count = model.objects.filter(author=user_id).count()

        # Return the count as JSON
        return JsonResponse({'model': model_name, 'count': count})

@extend_schema(
    parameters=[
        OpenApiParameter(name='search', description='Search term', required=False, type=str),
    ],
    responses={200: 'Paginated list of objects owned by the user'},
)
class UserModelListView(generics.GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    def get(self, request, user_id, model_name):
        # Check if the model exists
        try:
            model_class = apps.get_model("oaexample_app", model_name)
        except LookupError:
            return JsonResponse({'detail': 'Model not found.'}, status=404)

        # Filter the queryset based on author
        queryset = model_class.objects.filter(author_id=user_id)

        # Apply search filtering
        self.search_fields = SEARCH_FIELDS_MAPPING.get(model_name, [])
        search_query = request.query_params.get('search')
        if search_query:
            queryset = self.filter_queryset(queryset)

        serializer_class = self.get_serializer_class(model_class)

        if not serializer_class:
            return JsonResponse({'detail': 'Serializer not found for this model.'}, status=404)

        # Apply pagination
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = serializer_class(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def get_serializer_class(self, model_class):
        # Dynamically determine the serializer class based on the model
        return SERIALZE_MODEL_MAP.get(model_class.__name__)

    def filter_queryset(self, queryset):
        search_filter = filters.SearchFilter()
        return search_filter.filter_queryset(self.request, queryset, self)



class RenderFrontendIndex(APIView):
    def get(self, request, *args, **kwargs):
        with open(os.getenv("FRONTEND_INDEX_HTML", "index.html"), 'r') as file:
            html_content = file.read()

        modified_html = html_content
        frontend_url = settings.FRONTEND_URL

        # Prepend the host to all relative URLs
        def prepend_host(match):
            url = match.group(1)
            if url.startswith('/') or not url.startswith(('http://', 'https://')):
                return f'{match.group(0)[:5]}{frontend_url}{url.lstrip("/")}"'
            return match.group(0)

        # Prepend the host to all relative src and href URLs
        modified_html = re.sub(r'src="([^"]+)"', prepend_host, modified_html)
        modified_html = re.sub(r'href="([^"]+)"', prepend_host, modified_html)

        return HttpResponse(modified_html, content_type='text/html')


from django.shortcuts import redirect

def redirect_to_frontend(request, provider=None):
#    session = LoginSession(request, "social_login_redirected", settings.SESSION_COOKIE_NAME)

    frontend_url = settings.FRONTEND_URL
    redirect_path = "/account/provider/callback/"
    if provider:
        response = redirect(f'{frontend_url}{redirect_path}?provider={provider}')
    else:
        response = redirect(f'{frontend_url}{redirect_path}')

#    response.url = redirect_url
#    session.save(response)
    return response
####OBJECT-ACTIONS-CORE-ENDS####

from django.contrib.auth import get_user_model
from django.conf import settings
from allauth.account.models import EmailAddress
from allauth.account.utils import complete_signup, perform_login
from allauth.socialaccount.sessions import LoginSession
from rest_framework import status
from .serializers import VerifyPhoneSerializer, PhoneNumberSerializer

import random
import os





















