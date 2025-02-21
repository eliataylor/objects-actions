import openai
from rest_framework import serializers
from django.db import models

from .models import OasheetsSchemaDefinition
from .utils import sanitize_json

class OasheetsSchemaPromptSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True)
    config_id = serializers.IntegerField(required=False)
    run_id = serializers.IntegerField(required=False)
    thread_id = serializers.IntegerField(required=False)
    assistant_id = serializers.IntegerField(required=False)
    message_id = serializers.IntegerField(required=False)
    preserve = serializers.DictField(required=False)


class OasheetsSchemaDefinitionSerializer(serializers.ModelSerializer):
    versions_count = serializers.SerializerMethodField()
    version_tree = serializers.SerializerMethodField()

    # assistantconfig

    class Meta:
        model = OasheetsSchemaDefinition
        fields = "__all__"
        read_only_fields = [
            'created_at',
            'modified_at',
            'versions_count',
            'version_tree'
        ]


    def get_version_tree(self, obj):
        """Retrieve version tree"""
        def get_version_tree(schema):
            children = OasheetsSchemaDefinition.objects.filter(parent=schema)

            return {
                "id": schema.id,
                "name": schema.prompt if len(schema.prompt) > 80 else schema.prompt[: 80 - 3] + "...",
                "children": [get_version_tree(child) for child in children]
            }

        return get_version_tree(obj if not obj.parent else obj.parent)

    def get_versions_count(self, obj):
        """Get the count of versions for this schema"""
        # If this is a root schema, count its versions
        if obj.parent is None:
            return OasheetsSchemaDefinition.objects.filter(parent=obj).count()
        # If this is a version, count its siblings + 1 (for the root)
        return OasheetsSchemaDefinition.objects.filter(
            models.Q(parent=obj.parent) | models.Q(id=obj.parent.id)
        ).count()
