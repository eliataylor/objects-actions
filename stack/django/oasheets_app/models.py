from django.db import models
from django.contrib.auth import get_user_model
from .utils import sanitize_json
from django.utils.timezone import now

User = get_user_model()

# Model to track assistant creation
class PromptConfig(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    collaborators = models.ManyToManyField(User, related_name="collaborators", blank=True)

    # OpenAI ids
    assistant_id = models.CharField(max_length=100, null=True, blank=True)
    thread_id = models.CharField(max_length=100, null=True, blank=True)
    message_id = models.CharField(max_length=100, null=True, blank=True)
    run_id = models.CharField(max_length=100, null=True, blank=True)

    # different OpenAI assistant configurations
    class VariantChoices(models.TextChoices):
        stream = ("stream", "Stream")
        request = ("request", "Request")

    variant = models.CharField(max_length=10, choices=VariantChoices.choices, verbose_name='Variant', blank=True,
                               null=True, default=VariantChoices.request)

    def __str__(self):
        return next(
            (field for field in [self.run_id, self.message_id, self.thread_id, self.assistant_id] if field),
            f"Config: {self.id}"
        )

    openai_model = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        app_label = 'oasheets_app'

    def save(self, *args, **kwargs):
        self.modified_at = now()
        super().save(*args, **kwargs)

class SchemaVersions(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(class)s_created", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class PrivacyChoices(models.TextChoices):
        public = ("public", "Public")
        unlisted = ("unlisted", "Unlisted")
        inviteonly = ("inviteonly", "Invite Only")
        authusers = ("authusers", "Authenticated Users")
        onlyme = ("onlyme", "Only Me")
        archived = ("archived", "archived")
    privacy = models.CharField(max_length=10, choices=PrivacyChoices.choices, verbose_name='Privacy', blank=True, null=True, default=PrivacyChoices.onlyme)

    # prompt should be unique per user
    prompt = models.TextField(max_length=2555, verbose_name='Prompt', blank=False, null=False)
    config = models.ForeignKey(PromptConfig, on_delete=models.PROTECT, related_name="prompt_config")

    # OpenAI ids
    assistant_id = models.CharField(max_length=100, null=True, blank=True)
    thread_id = models.CharField(max_length=100, null=True, blank=True)
    message_id = models.CharField(max_length=100, null=True, blank=True)
    run_id = models.CharField(max_length=100, null=True, blank=True)

    response = models.TextField(blank=True, null=True) # reasoning
    schema = models.JSONField(blank=True, null=True) # validated and parsed schema

    # Version tracking fields
    versions_count = models.PositiveIntegerField(default=0, editable=False)
    version_tree = models.JSONField(default=dict, blank=True, null=True, editable=False)

    # original idea is when parent is NULL
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='versions'
    )
    version_notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Schema Version"
        verbose_name_plural = "Schema Versions"
        ordering = ['-created_at']

    def __str__(self):
        prompt_preview = self.prompt[:40] + "..." if len(self.prompt) > 40 else self.prompt
        return f"# [{self.id}]: {prompt_preview}"

    def save(self, *args, **kwargs):
        if self.schema:
            self.schema = sanitize_json(self.schema)

        # Compute versions count and version tree
        self.versions_count = self.compute_versions_count()
        self.version_tree = self.compute_version_tree()

        super().save(*args, **kwargs)

    def compute_versions_count(self):
        """Recursively count all descendant versions of this schema"""
        if not self.pk:  # Ensure the instance has been saved
            return 0

        def count_children(schema):
            children = SchemaVersions.objects.filter(parent=schema)
            return children.count() + sum(count_children(child) for child in children)

        return count_children(self)

    def compute_version_tree(self):
        if not self.pk:  # Ensure the instance has been saved
            return None

        root = self
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
