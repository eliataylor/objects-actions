import openai
from rest_framework import serializers
from django.db import models

from .models import OasheetsSchemaDefinition
from .utils import sanitize_json

class OasheetsSchemaPromptSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True)
    config_id = serializers.IntegerField(required=False)


class OasheetsSchemaDefinitionSerializer(serializers.ModelSerializer):
    versions_count = serializers.SerializerMethodField()
    versions = serializers.SerializerMethodField()

    class Meta:
        model = OasheetsSchemaDefinition
        fields = "__all__"
        read_only_fields = [
            'created_at',
            'modified_at',
            'version',
            'versions',
            'versions_count'
        ]

    def get_versions(self, obj):
        """Retrieve all child worksheets based on parent_id"""
        child_worksheets = obj.versions.all()  # Uses related_name='versions'
        return OasheetsSchemaDefinitionSerializer(child_worksheets, many=True).data

    def get_versions_count(self, obj):
        """Get the count of versions for this schema"""
        # If this is a root schema, count its versions
        if obj.parent is None:
            return OasheetsSchemaDefinition.objects.filter(parent=obj).count()
        # If this is a version, count its siblings + 1 (for the root)
        return OasheetsSchemaDefinition.objects.filter(
            models.Q(parent=obj.parent) | models.Q(id=obj.parent.id)
        ).count()
