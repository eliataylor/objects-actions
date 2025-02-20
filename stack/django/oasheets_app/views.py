from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models

from .models import OasheetsSchemaDefinition
from .serializers import OasheetsSchemaDefinitionSerializer, OasheetsSchemaPromptSerializer
from .services.generator_service import OasheetsGeneratorService


class OasheetsSchemaGeneratorViewSet(viewsets.ModelViewSet):
    queryset = OasheetsSchemaDefinition.objects.all()
    serializer_class = OasheetsSchemaDefinitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OasheetsSchemaDefinition.objects.filter(author=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = OasheetsSchemaPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt_data = serializer.validated_data

        generator = OasheetsGeneratorService(request.user)
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
        """Enhance existing schema with additional requirements"""
        schema_definition = self.get_object()

        serializer = OasheetsSchemaPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_prompt = serializer.validated_data['prompt']

        generator = OasheetsGeneratorService(request.user)

        # Generate an enhanced schema based on the new prompt and original schema
        result = generator.enhance_schema(
            new_prompt=new_prompt,
            original_schema_id=schema_definition.id,
            user=request.user
        )

        if result:
            return Response({
                'success': True,
                'data': result
            })
        else:
            return Response(
                {'error': 'Schema enhancement failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """
        Retrieve all versions of a schema, including the root schema
        """
        schema = self.get_object()

        # Determine if this is a root schema or a version
        if schema.parent:
            root_schema = schema.parent
        else:
            root_schema = schema

        # Get all versions and the root schema
        queryset = OasheetsSchemaDefinition.objects.filter(
            models.Q(parent=root_schema) | models.Q(id=root_schema.id)
        ).order_by('version')

        serializer = self.get_serializer(queryset, many=True)

        return Response({
            'root_schema_id': root_schema.id,
            'versions': serializer.data
        })
