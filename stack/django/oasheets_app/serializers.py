from rest_framework import serializers

from oaexample_app.serializers import CustomSerializer
from .models import SchemaVersions

class PostedPromptSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True)
    privacy = serializers.ChoiceField(choices=SchemaVersions.PrivacyChoices.choices,
                                      default=SchemaVersions.PrivacyChoices.public)
    version_id = serializers.IntegerField(required=False)
    openai_model = serializers.CharField(default="gpt-4o-mini")

    def validate(self, attrs):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            attrs["privacy"] = SchemaVersions.PrivacyChoices.public
        return attrs


class SchemaVersionSerializer(CustomSerializer):
    versions_count = serializers.SerializerMethodField()
    version_tree = serializers.SerializerMethodField()

    class Meta:
        model = SchemaVersions
        fields = "__all__"
        read_only_fields = [
            'created_at',
            'versions_count',
            'version_tree'
        ]

    def get_version_tree(self, obj):
        """Retrieve version tree"""
        root = obj
        while root.parent:
            root = root.parent

        def build_tree(schema):
            children = SchemaVersions.objects.filter(parent=schema)

            # TODO: filter by privacy! / status

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
