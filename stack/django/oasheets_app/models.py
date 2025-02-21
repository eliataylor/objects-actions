from django.db import models
from django.contrib.auth import get_user_model
from .utils import sanitize_json
from django.utils.timezone import now

User = get_user_model()

# Model to track assistant creation
class AssistantConfig(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    assistant_id = models.CharField(max_length=100, null=True, blank=True) # openai id
    thread_id = models.CharField(max_length=100, null=True, blank=True)  # openai id
    run_id = models.CharField(max_length=100, null=True, blank=True)  # openai id
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)
    openai_model = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        app_label = 'oasheets_app'

    def save(self, *args, **kwargs):
        self.modified_at = now()
        super().save(*args, **kwargs)

class OasheetsSchemaDefinition(models.Model):
    prompt = models.TextField(max_length=512)
    run_id = models.CharField(max_length=100)  # openai id

    response = models.TextField(blank=True, null=True)
    schema = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_created")
    assistantconfig = models.ForeignKey(AssistantConfig, on_delete=models.PROTECT, related_name="assistant_schema")

    versions_count = models.PositiveIntegerField(default=0, editable=False)
    version_tree = models.JSONField(default=dict, blank=True, editable=False)

    # Version tracking fields
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='versions'
    )
    version_notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Oasheets Schema"
        verbose_name_plural = "Oasheets Schemas"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.parent_id}: {self.id}: {self.prompt}".strip()

    def save(self, *args, **kwargs):
        if self.schema:
            self.schema = sanitize_json(self.schema)

        # Compute versions count and version tree
        self.versions_count = self.compute_versions_count()
        self.version_tree = self.compute_version_tree()

        super().save(*args, **kwargs)

    def compute_versions_count(self):
        if self.parent is None:
            return OasheetsSchemaDefinition.objects.filter(parent=self).count()
        return OasheetsSchemaDefinition.objects.filter(
            models.Q(parent=self.parent) | models.Q(id=self.parent.id)
        ).count()

    def compute_version_tree(self):
        def build_tree(schema):
            children = OasheetsSchemaDefinition.objects.filter(parent=schema)
            return {
                "id": schema.id,
                "name": schema.prompt if len(schema.prompt) > 80 else schema.prompt[: 80 - 3] + "...",
                "children": [build_tree(child) for child in children]
            }

        return build_tree(self if not self.parent else self.parent)
