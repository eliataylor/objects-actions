####OBJECT-ACTIONS-VIEWSET-IMPORTS-STARTS####
from rest_framework import viewsets, permissions, filters, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.pagination import LimitOffsetPagination
from rest_framework import viewsets, permissions, filters, generics
from rest_framework.views import APIView
from django.http import JsonResponse
from django.core.management import call_command
from django.apps import apps
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils import timezone
from .services import send_sms
import random
import re
import os
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from .serializers import TopicsSerializer
from .models import Topics
from .serializers import ResourceTypesSerializer
from .models import ResourceTypes
from .serializers import MeetingTypesSerializer
from .models import MeetingTypes
from .serializers import StatesSerializer
from .models import States
from .serializers import PartiesSerializer
from .models import Parties
from .serializers import StakeholdersSerializer
from .models import Stakeholders
from .serializers import ResourcesSerializer
from .models import Resources
from .serializers import UsersSerializer
from .models import Users
from .serializers import CitiesSerializer
from .models import Cities
from .serializers import OfficialsSerializer
from .models import Officials
from .serializers import RalliesSerializer
from .models import Rallies
from .serializers import ActionPlansSerializer
from .models import ActionPlans
from .serializers import MeetingsSerializer
from .models import Meetings
from .serializers import InvitesSerializer
from .models import Invites
from .serializers import SubscriptionsSerializer
from .models import Subscriptions
from .serializers import RoomsSerializer
from .models import Rooms
from .serializers import AttendeesSerializer
from .models import Attendees
####OBJECT-ACTIONS-VIEWSET-IMPORTS-ENDS####


class LimitedLimitOffsetPagination(LimitOffsetPagination):
    max_limit = 100


class PaginatedViewSet(viewsets.ModelViewSet):
    pagination_class = LimitOffsetPagination

    def apply_pagination(self, queryset):
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, self.request, view=self)

        serializer_class = self.get_serializer_class_for_queryset(queryset)
        serializer = serializer_class(paginated_queryset, many=True)

        paginated_data = {
            'count': paginator.count,  # Total number of items
            'limit': paginator.limit,  # Number of items per page
            'offset': paginator.offset,  # Starting position of the current page
            #            'next': paginator.get_next_link(),  # Link to the next page, if available
            #            'previous': paginator.get_previous_link(),  # Link to the previous page, if available
            'results': serializer.data
        }

        return paginated_data

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data)

    def apply_status_filter(self, queryset):
        status_param = self.request.query_params.get('status')
        if status_param:
            status_list = status_param.split(',')
            if len(status_list) > 1:
                queryset = queryset.filter(status__in=status_list)
            else:
                queryset = queryset.filter(status=status_param)
        return queryset

    def get_serializer_class_for_queryset(self, queryset):
        # Use model's meta information to dynamically select the serializer
        model = queryset.model

        # Map models to serializers
        model_to_serializer = {}

        # Return the corresponding serializer class
        return model_to_serializer.get(model, self.get_serializer_class())


####OBJECT-ACTIONS-VIEWSETS-STARTS####
class TopicsViewSet(viewsets.ModelViewSet):
    queryset = Topics.objects.all().order_by('id')
    serializer_class = TopicsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    
class ResourceTypesViewSet(viewsets.ModelViewSet):
    queryset = ResourceTypes.objects.all().order_by('id')
    serializer_class = ResourceTypesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    
class MeetingTypesViewSet(viewsets.ModelViewSet):
    queryset = MeetingTypes.objects.all().order_by('id')
    serializer_class = MeetingTypesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    
class StatesViewSet(viewsets.ModelViewSet):
    queryset = States.objects.all().order_by('id')
    serializer_class = StatesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    
class PartiesViewSet(viewsets.ModelViewSet):
    queryset = Parties.objects.all().order_by('id')
    serializer_class = PartiesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    
class StakeholdersViewSet(viewsets.ModelViewSet):
    queryset = Stakeholders.objects.all().order_by('id')
    serializer_class = StakeholdersSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    
class ResourcesViewSet(viewsets.ModelViewSet):
    queryset = Resources.objects.all().order_by('id')
    serializer_class = ResourcesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    
class UsersViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all().order_by('id')
    serializer_class = UsersSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name']

    
class CitiesViewSet(viewsets.ModelViewSet):
    queryset = Cities.objects.all().order_by('id')
    serializer_class = CitiesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    
class OfficialsViewSet(viewsets.ModelViewSet):
    queryset = Officials.objects.all().order_by('id')
    serializer_class = OfficialsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    
class RalliesViewSet(viewsets.ModelViewSet):
    queryset = Rallies.objects.all().order_by('id')
    serializer_class = RalliesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    
class ActionPlansViewSet(viewsets.ModelViewSet):
    queryset = ActionPlans.objects.all().order_by('id')
    serializer_class = ActionPlansSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    
class MeetingsViewSet(viewsets.ModelViewSet):
    queryset = Meetings.objects.all().order_by('id')
    serializer_class = MeetingsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    
class InvitesViewSet(viewsets.ModelViewSet):
    queryset = Invites.objects.all().order_by('id')
    serializer_class = InvitesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['meeting__title']

    
class SubscriptionsViewSet(viewsets.ModelViewSet):
    queryset = Subscriptions.objects.all().order_by('id')
    serializer_class = SubscriptionsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['rally__title', 'meeting__title']

    
class RoomsViewSet(viewsets.ModelViewSet):
    queryset = Rooms.objects.all().order_by('id')
    serializer_class = RoomsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['rally__title', 'meeting__title']

    
class AttendeesViewSet(viewsets.ModelViewSet):
    queryset = Attendees.objects.all().order_by('id')
    serializer_class = AttendeesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    
####OBJECT-ACTIONS-VIEWSETS-ENDS####


####OBJECT-ACTIONS-CORE-STARTS####
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

SEARCH_FIELDS_MAPPING = {
  "Topics": [
    "name"
  ],
  "ResourceTypes": [
    "name"
  ],
  "MeetingTypes": [
    "name"
  ],
  "States": [
    "name"
  ],
  "Parties": [
    "name"
  ],
  "Stakeholders": [
    "name"
  ],
  "Resources": [
    "title"
  ],
  "Users": [
    "first_name",
    "last_name"
  ],
  "Cities": [
    "name"
  ],
  "Officials": [
    "title"
  ],
  "Rallies": [
    "title"
  ],
  "ActionPlans": [
    "title"
  ],
  "Meetings": [
    "title"
  ],
  "Invites": [
    "meeting__title"
  ],
  "Subscriptions": [
    "rally__title",
    "meeting__title"
  ],
  "Rooms": [
    "rally__title",
    "meeting__title"
  ],
  "Attendees": []
}

SERIALZE_MODEL_MAP = { "Topics": TopicsSerializer,"ResourceTypes": ResourceTypesSerializer,"MeetingTypes": MeetingTypesSerializer,"States": StatesSerializer,"Parties": PartiesSerializer,"Stakeholders": StakeholdersSerializer,"Resources": ResourcesSerializer,"Users": UsersSerializer,"Cities": CitiesSerializer,"Officials": OfficialsSerializer,"Rallies": RalliesSerializer,"ActionPlans": ActionPlansSerializer,"Meetings": MeetingsSerializer,"Invites": InvitesSerializer,"Subscriptions": SubscriptionsSerializer,"Rooms": RoomsSerializer,"Attendees": AttendeesSerializer }

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

        serializer_class = self.get_serializer_classname(model_class)

        if not serializer_class:
            return JsonResponse({'detail': 'Serializer not found for this model.'}, status=404)

        # Apply pagination
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = serializer_class(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def get_serializer_classname(self, model_class):
        # Dynamically determine the serializer class based on the model
        return SERIALZE_MODEL_MAP.get(model_class.__name__)

    def filter_queryset(self, queryset):
        search_filter = filters.SearchFilter()
        return search_filter.filter_queryset(self.request, queryset, self)



class RenderFrontendIndex(APIView):
    def get(self, request, *args, **kwargs):
        file_path = os.getenv("FRONTEND_INDEX_HTML", "index.html")
        if not os.path.isfile(file_path):
            return HttpResponse('Ok', content_type='text/html')

        with open(file_path, 'r') as file:
            html_content = file.read()

        modified_html = html_content
        frontend_url = settings.FRONTEND_URL

        # Prepend the host to all relative URLs
        def prepend_host(match):
            url = match.group(1)
            if url.startswith('/') or not url.startswith(('http://', 'https://')):
                return f'{match.group(0)[:5]}{frontend_url}/{url.lstrip("/")}"'
            return match.group(0)

        # Prepend the host to all relative src and href URLs
        modified_html = re.sub(r'src="([^"]+)"', prepend_host, modified_html)
        modified_html = re.sub(r'href="([^"]+)"', prepend_host, modified_html)

        # react-scripts bundle instead of compiled version
        if ":3000" in frontend_url:
            modified_html = modified_html.replace('</head>',
                                                  f'<script defer="" src="{frontend_url}/static/js/bundle.js"></script></head>')

        return HttpResponse(modified_html, content_type='text/html')

def redirect_to_frontend(request, provider=None):
    frontend_url = os.getenv('REACT_APP_APP_HOST', 'https://localhost.oaexample.com:3000')
    redirect_path = request.path
    query_params = request.GET.copy()
    if "provider" in query_params:
        redirect_path = redirect_path.replace("provider", query_params['provider'])
    query_string = query_params.urlencode()
    response = redirect(f'{frontend_url}{redirect_path}?{query_string}')
    return response

####OBJECT-ACTIONS-CORE-ENDS####

from django.contrib.auth import get_user_model
from django.conf import settings
from allauth.account.models import EmailAddress
from allauth.account.utils import complete_signup, perform_login
from allauth.socialaccount.sessions import LoginSession
from rest_framework import status
from .serializers import VerifyPhoneSerializer, PhoneNumberSerializer

import os


class SendCodeView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow any user to access this view

    @extend_schema(
        request=PhoneNumberSerializer,
        responses={
            200: OpenApiResponse(description='SMS sent successfully', examples={
                'application/json': {"detail": "SMS sent successfully"}
            }),
            400: OpenApiResponse(description='Bad request', examples={
                'application/json': {"phone_number": ["This field is required."]}
            }),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = PhoneNumberSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone']
            code = str(random.randint(1000, 999999))
            if phone_number == '+14159999999':
                return JsonResponse({"detail": "Enter your Demo Account code"}, status=status.HTTP_200_OK)
            message = f"Your oaexample.com verification code is {code}"
            send_sms(phone_number, message)
            request.session['code'] = code
            return JsonResponse({"detail": "SMS sent successfully"}, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyCodeView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow any user to access this view

    @extend_schema(
        request=VerifyPhoneSerializer,
        responses={
            200: OpenApiResponse(description='SMS sent successfully', examples={
                'application/json': {"detail": "SMS sent successfully", "id": "user id"}
            }),
            400: OpenApiResponse(description='Bad request', examples={
                'application/json': {"phone_number": ["This field is required."]}
            }),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = VerifyPhoneSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone']
            code = str(serializer.validated_data['code'])
            if str(request.session.get('code')) == code or (phone_number == '+14159999999' and code == '542931'):

                redirect_url = f"/"

                try:
                    user = get_user_model().objects.get(phone=phone_number)
                    created = False
                except get_user_model().DoesNotExist:
                    user = get_user_model().objects.create(username=phone_number,
                                                           email=f'{phone_number}@sms-placeholder.com',
                                                           phone=phone_number)
                    created = True
                    redirect_url = f"/onboarding"

                if created:
                    user.phone = phone_number  # Save the phone field
                    user.set_unusable_password()  # Set password logic as needed
                    user.save()
                    email_address = EmailAddress.objects.create(user=user, email=user.email, verified=True,
                                                                primary=True)
                    response = complete_signup(request, user, False, redirect_url)
                else:
                    response = perform_login(
                        request,
                        user,
                        False,
                        redirect_url)

                LoginSession(request, "sms_login_session", settings.SESSION_COOKIE_NAME)
                response = JsonResponse({"detail": "Verification successful",
                                         "id": user.id,
                                         "redirect": redirect_url},
                                        status=status.HTTP_200_OK)
                response.url = redirect_url
                response.apiVersion = timezone.now()
                return response

            return JsonResponse({"error": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)