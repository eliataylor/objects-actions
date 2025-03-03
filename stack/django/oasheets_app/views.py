import csv

from django.db import models
from django.http import HttpResponse
from django.http import JsonResponse
from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from oaexample_app.views import PaginatedViewSet
from .models import SchemaVersions
from .serializers import SchemaVersionSerializer, PostedPromptSerializer
from .services.generator_service import Prompt2SchemaService


class SchemaVersionsViewSet(PaginatedViewSet):
    queryset = SchemaVersions.objects.all()
    serializer_class = SchemaVersionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Filters out archived schemas and applies privacy-based access control.
        """
        user = self.request.user

        if not user.is_authenticated:
            queryset = SchemaVersions.objects.filter(
                privacy__in=[SchemaVersions.PrivacyChoices.public, SchemaVersions.PrivacyChoices.unlisted])
        else:
            queryset = SchemaVersions.objects.filter(
                models.Q(privacy__in=[SchemaVersions.PrivacyChoices.public, SchemaVersions.PrivacyChoices.unlisted,
                                      SchemaVersions.PrivacyChoices.authusers]) |
                models.Q(privacy=SchemaVersions.PrivacyChoices.inviteonly,
                         config__collaborators=user) |  # TODO: CRUD operations for collaborators
                models.Q(privacy=SchemaVersions.PrivacyChoices.onlyme, author=user)
            )

        return queryset.order_by('created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(parent_id=None).exclude(
            privacy=SchemaVersions.PrivacyChoices.unlisted).order_by('-created_at')
        data = self.apply_pagination(queryset)
        return JsonResponse(data)

    def retrieve(self, request, pk=None):
        schema = self.get_object()

        if request.user is None and schema.privacy not in [SchemaVersions.PrivacyChoices.public,
                                                           SchemaVersions.PrivacyChoices.unlisted]:
            return Response({"error": "Login to view this schema."},
                            status=status.HTTP_403_FORBIDDEN)

        if schema.privacy == SchemaVersions.PrivacyChoices.onlyme and schema.author != request.user:
            return Response({"error": "You are not authorized to access this schema."},
                            status=status.HTTP_403_FORBIDDEN)

        if schema.privacy == SchemaVersions.PrivacyChoices.inviteonly and request.user not in schema.config.collaborators.all():
            return Response({"error": "You need an invitation to view this schema."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(schema)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Toggle between streaming and non-streaming responses based on query param `stream=true`.
        """
        serializer = PostedPromptSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt_data = serializer.validated_data
        variant = 'stream' if request.query_params.get("stream") == "true" else 'request'
        generator = Prompt2SchemaService(request.user, variant)

        if "config_id" in prompt_data:
            config = generator.load_config(
                prompt_data['config_id'],
                *(prompt_data[key] for key in ['thread_id', 'message_id', 'run_id'] if key in prompt_data)
            )
            if config.author != request.user:
                generator.set_config(None)

        if variant == "stream":
            response_generator = generator.generate_via_stream(prompt_data['prompt'], prompt_data['privacy'],
                                                               request.user)
            return StreamingHttpResponse(response_generator, content_type="application/json")

        result = generator.generate_schema(prompt_data['prompt'], prompt_data['privacy'], request.user)
        if result:
            return Response({"success": True, "data": result})
        else:
            return Response({"error": "Schema generation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def enhance(self, request, pk=None):
        schema = self.get_object()

        if request.user is None and schema.privacy not in [SchemaVersions.PrivacyChoices.public,
                                                           SchemaVersions.PrivacyChoices.unlisted]:
            return Response({"error": "Login to view this schema."},
                            status=status.HTTP_403_FORBIDDEN)

        if schema.privacy == SchemaVersions.PrivacyChoices.onlyme and schema.author != request.user:
            return Response({"error": "You are not authorized to enhance this schema."},
                            status=status.HTTP_403_FORBIDDEN)

        if schema.privacy == SchemaVersions.PrivacyChoices.inviteonly and request.user not in schema.config.collaborators.all():
            return Response({"error": "You need an invitation to enhance this schema."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = PostedPromptSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        variant = 'stream' if request.query_params.get("stream") == "true" else 'request'
        prompt_data = serializer.validated_data
        generator = Prompt2SchemaService(request.user, variant)

        if "config_id" in prompt_data:
            config = generator.load_config(
                prompt_data['config_id'],
                *(prompt_data[key] for key in ['thread_id', 'message_id', 'run_id'] if key in prompt_data)
            )
            if config.author != request.user:
                generator.set_config(None)

        if request.query_params.get("stream") == "true":
            response_generator = generator.enhance_via_stream(prompt_data['prompt'], prompt_data['privacy'],
                                                              request.user, schema)
            return StreamingHttpResponse(response_generator, content_type="application/json")

        result = generator.enhance_schema(prompt_data['prompt'], prompt_data['privacy'], request.user, schema)

        if result:
            return Response({"success": True, "data": result})
        else:
            return Response({"error": "Schema enhancement failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='download')
    def download_csv(self, request, pk=None):
        version = self.get_object()

        # Validate user permissions
        if not request.user.is_authenticated and version.privacy not in [
            SchemaVersions.PrivacyChoices.public, SchemaVersions.PrivacyChoices.unlisted
        ]:
            return Response({"error": "You are not authorized to download this schema."}, status=403)

        # CSV headers
        headers = [
            "Types", "Field Label", "Field Name", "Field Type",
            "HowMany", "Required", "Relationship", "Default", "Example"
        ]

        # Extract schema fields
        schema_data = version.schema  # Assuming schema.config stores the ValidateSchema data
        if schema_data is None:
            return Response({"error": "This version has no schema"}, status=204)
        rows = []

        for content_type in schema_data.get('content_types', []):
            # Add the model name as a row with empty field columns
            rows.append([content_type['name'], '', '', '', '', '', '', '', ''])

            for field in content_type.get('fields', []):
                rows.append([
                    '',  # Keep Types column empty for fields
                    field.get('label', '') or '',
                    field.get('name', '') or '',  # Assuming 'name' maps to Field Name
                    field.get('field_type', '') or '',
                    field.get('cardinality', '') or '',
                    '1' if field.get('required', False) else '0',
                    field.get('relationship', '') or '',
                    field.get('default', '') or '',
                    field.get('example', '') or '',
                ])


        # Generate CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="object-fields-version-{version.id}_schema.csv"'

        writer = csv.writer(response)
        writer.writerow(headers)
        writer.writerows(rows)

        return response

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
