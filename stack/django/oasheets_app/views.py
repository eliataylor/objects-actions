from django.utils.translation.trans_null import activate
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from django.db import models

from .models import OasheetsSchemaDefinition
from .serializers import OasheetsSchemaDefinitionSerializer, OasheetsSchemaPromptSerializer
from .services.generator_service import OasheetsGeneratorService
from oaexample_app.views import PaginatedViewSet

class OasheetsSchemaGeneratorViewSet(PaginatedViewSet):
    queryset = OasheetsSchemaDefinition.objects.all()
    serializer_class = OasheetsSchemaDefinitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO: correct sorting as thread
        return OasheetsSchemaDefinition.objects.filter(author=self.request.user, assistantconfig__active=True, parent_id=None).order_by('created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        data = self.apply_pagination(queryset)
        return JsonResponse(data)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = OasheetsSchemaPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt_data = serializer.validated_data

        generator = OasheetsGeneratorService(request.user)

        if "config_id" in prompt_data:
            generator.set_assistant(prompt_data['config_id'])

        result = generator.generate_schema(prompt_data['prompt'], request.user)

        if result:
            return Response({
                'success': True,
                'data': result
            })
        else:
            return Response(
                {'error': 'Schema generation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def enhance(self, request, pk=None):
        """
        Enhance a specific schema version based on additional requirements.
        """
        schema_definition = self.get_object()

        if schema_definition.author != request.user:
            return Response({"error": "You are not authorized to enhance this schema."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = OasheetsSchemaPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_prompt = serializer.validated_data['prompt']

        generator = OasheetsGeneratorService(request.user)
        generator.set_assistant(schema_definition.assistantconfig_id)

        result = generator.enhance_schema(
            new_prompt=new_prompt,
            original_schema_id=schema_definition.id,
            user=request.user
        )

        if result:
            return Response({"success": True, "data": result})
        else:
            return Response({"error": "Schema enhancement failed."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """
        Retrieve all versions of a schema, including the root schema.
        Ensures that only the author can access their schema versions.
        """
        schema = self.get_object()

        if schema.author != request.user:
            return Response({"error": "You are not authorized to access these versions."},
                            status=status.HTTP_403_FORBIDDEN)

        root_schema = schema.parent if schema.parent else schema

        queryset = OasheetsSchemaDefinition.objects.filter(
            models.Q(parent=root_schema) | models.Q(id=root_schema.id)
        ).order_by('version')

        serializer = self.get_serializer(queryset, many=True)
        return Response({"root_schema_id": root_schema.id, "versions": serializer.data})

    @action(detail=True, methods=['delete'], url_path='delete-version')
    def delete_version(self, request, pk=None):
        """
        Delete a specific version of a schema.
        Only the author can delete their versions.
        """
        schema = self.get_object()

        if schema.author != request.user:
            return Response({"error": "You are not authorized to delete this version."},
                            status=status.HTTP_403_FORBIDDEN)

        if schema.parent is None:
            return Response({"error": "Root schemas cannot be deleted."},
                            status=status.HTTP_400_BAD_REQUEST)

        schema.delete()
        return Response({"message": "Version deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response({"error": "You are not authorized to delete this schema."},
                            status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
