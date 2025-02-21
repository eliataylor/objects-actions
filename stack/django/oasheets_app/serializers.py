import openai
from rest_framework import serializers
from django.db import models

from .models import SchemaVersions
from oaexample_app.serializers import CustomSerializer
from .utils import sanitize_json

class PostedPromptSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True)
    config_id = serializers.IntegerField(required=False)
    run_id = serializers.CharField(required=False)
    thread_id = serializers.CharField(required=False)
    assistant_id = serializers.CharField(required=False)
    message_id = serializers.CharField(required=False)
    stream = serializers.BooleanField(required=False, default=True)



class SchemaVersionSerializer(CustomSerializer):
    versions_count = serializers.SerializerMethodField()
    version_tree = serializers.SerializerMethodField()

    class Meta:
        model = SchemaVersions
        fields = "__all__"
        read_only_fields = [
            'created_at',
            'modified_at',
            'versions_count',
            'version_tree'
        ]

    def to_representation(self, instance):
        """Override to inject config fields into the representation"""
        representation = super().to_representation(instance)

        # Extract `config` related fields if `config` exists
        if instance.config:
            config_data = {
                "run_id": instance.config.run_id,
                "thread_id": instance.config.thread_id,
                "message_id": instance.config.message_id,
                "assistant_id": instance.config.assistant_id,
            }

            # Ensure config exists in the serialized representation and inject values
            if "config" not in representation:
                representation["config"] = {}
            representation["config"].update(config_data)

        return representation

    def get_version_tree(self, obj):
        """Retrieve version tree"""
        root = obj
        while root.parent:
            root = root.parent

        def build_tree(schema):
            children = SchemaVersions.objects.filter(parent=schema)

            return {
                "id": schema.id,
                "name": schema.prompt if len(schema.prompt) > 80 else schema.prompt[: 80 - 3] + "...",
                "children": [build_tree(child) for child in children]
            }

        return build_tree(root)

    def get_versions_count(self, obj):
        """Get the count of all direct and indirect child versions for this schema"""

        def count_children(schema):
            children = SchemaVersions.objects.filter(parent=schema)
            return children.count() + sum(count_children(child) for child in children)

        return count_children(obj)

