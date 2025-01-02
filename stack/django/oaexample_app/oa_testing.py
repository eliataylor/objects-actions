from django.contrib.auth.models import Group
from .models import Users
from .serializers import UsersSerializer
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from django.apps import apps
import logging
logger = logging.getLogger(__name__)

# Constants
OA_TESTER_GROUP = 'oa-tester'

# Pagination Class
class OATesterPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# ViewSet
@extend_schema_view(
    list=extend_schema(description="List all users in the 'oa-tester' group."),
    create=extend_schema(description="Create a new user and add them to the 'oa-tester' group."),
    retrieve=extend_schema(description="Retrieve a specific 'oa-tester' user by ID."),
    update=extend_schema(description="Add the 'oa-tester' group to a specific user by ID."),
    partial_update=extend_schema(description="Add the 'oa-tester' group to a specific user by ID."),
    destroy=extend_schema(description="Delete a specific 'oa-tester' user by ID, along with their content.")
)
class OATesterUserViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.filter(groups__name=OA_TESTER_GROUP).order_by('id')
    serializer_class = UsersSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = OATesterPagination

    @extend_schema(description="Create a new user and automatically assign them to the 'oa-tester' group.")
    def create(self, request, *args, **kwargs):
        group = Group.objects.filter(name=OA_TESTER_GROUP).first()
        if not group:
            return Response({"error": f"Group '{OA_TESTER_GROUP}' does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        response = super().create(request, *args, **kwargs)
        user = Users.objects.get(id=response.data['id'])
        user.groups.add(group)
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='search')
    @extend_schema(
        description="Search for users in the 'oa-tester' group based on a query string.",
        parameters=[OpenApiParameter(name='q', description="Query string to search usernames or emails.", required=False, type=str)]
    )
    def search_users(self, request):
        query = request.query_params.get('q', '')
        queryset = self.queryset.filter( (Q(username__icontains=query) | Q(email__icontains=query)) & Q(groups__name=OA_TESTER_GROUP) )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(description="Add the 'oa-tester' group to a specific user by ID.")
    def update(self, request, *args, **kwargs):
        user = Users.objects.filter(id=kwargs['pk']).first()
        group = Group.objects.filter(name=OA_TESTER_GROUP).first()
        if not group:
            return Response({"error": f"Group '{OA_TESTER_GROUP}' does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        user.groups.add(group)
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(description="Add the 'oa-tester' group to a specific user by ID using PATCH.")
    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    @extend_schema(description="Delete a specific 'oa-tester' user by ID, along with their content.")
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        my_app_models = apps.get_app_config('oaexample_app').get_models()
        for model in my_app_models:
            if hasattr(model, 'author'):
                model.objects.filter(author=user).delete()

        # Delete the user
        user.delete()
        return Response({"message": f"User {user.username} and their content have been deleted."}, status=status.HTTP_200_OK)
