from django.utils.translation.trans_null import activate
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from django.http import StreamingHttpResponse
from django.db import models

from .models import SchemaVersions
from .serializers import SchemaVersionSerializer, PostedPromptSerializer
from .services.generator_service import Prompt2SchemaService
from oaexample_app.views import PaginatedViewSet

class SchemaVersionsViewSet(PaginatedViewSet):
    queryset = SchemaVersions.objects.all()
    serializer_class = SchemaVersionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # TODO: correct sorting as thread
        return SchemaVersions.objects.filter(author=self.request.user, config__active=True).order_by('created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset().filter(parent_id=None))
        data = self.apply_pagination(queryset)
        return JsonResponse(data)

    def retrieve(self, request, pk=None):
        schema = self.get_object()

        if schema.author != request.user:
            return Response({"error": "You are not authorized to access this schema."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(schema)
        response_data = serializer.data

        return Response(response_data)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Toggle between streaming and non-streaming responses based on query param `stream=true`.
        """
        serializer = PostedPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt_data = serializer.validated_data
        generator = Prompt2SchemaService(request.user)

        if "config_id" in prompt_data:
            generator.load_config(
                prompt_data['config_id'],
                *(prompt_data[key] for key in ['thread_id', 'message_id', 'run_id'] if key in prompt_data)
            )

        if request.query_params.get("stream") == "true":
            response_generator = generator.generate_schema_stream(prompt_data['prompt'], request.user)
            return StreamingHttpResponse(response_generator, content_type="application/json")

        result = generator.generate_schema(prompt_data['prompt'], request.user)
        if result:
            return Response({"success": True, "data": result})
        else:
            return Response({"error": "Schema generation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def enhance(self, request, pk=None):
        schema_version = self.get_object()

        if schema_version.author != request.user:
            return Response({"error": "You are not authorized to enhance this schema."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = PostedPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt_data = serializer.validated_data

        generator = Prompt2SchemaService(request.user)
        if "config_id" in prompt_data:
            generator.load_config(
                prompt_data['config_id'],
                *(prompt_data[key] for key in ['thread_id', 'message_id', 'run_id'] if key in prompt_data)
            )

        result = generator.enhance_schema(
            prompt_data['prompt'],
            schema_version=schema_version.id,
            user=request.user
        )

        if result:
            return Response({"success": True, "data": result})
        else:
            return Response({"error": "Schema enhancement failed."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
