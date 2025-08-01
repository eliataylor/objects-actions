from django.contrib.auth import get_user_model
from django.db import models
from django.utils.timezone import now

from .utils import sanitize_json

User = get_user_model()


# Model to track assistant creation
class ProjectSchema(models.Model):
    title = models.CharField(max_length=100, null=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)
    collaborators = models.ManyToManyField(User, related_name="collaborators", blank=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.modified_at = now()
        super().save(*args, **kwargs)


class SchemaVersions(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="+", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    project = models.ForeignKey(ProjectSchema, on_delete=models.PROTECT, related_name="project", blank=True, null=True)
    prompt = models.TextField(max_length=4000, blank=False, null=False)

    class PrivacyChoices(models.TextChoices):
        public = ("public", "Public")
        unlisted = ("unlisted", "Unlisted")
        inviteonly = ("inviteonly", "Invite Only")
        authusers = ("authusers", "Authenticated Users")
        onlyme = ("onlyme", "Only Me")
        archived = ("archived", "archived")

    privacy = models.CharField(max_length=10, choices=PrivacyChoices.choices, verbose_name='Privacy', blank=True,
                               null=True, default=PrivacyChoices.onlyme)

    # OpenAI IDs
    assistant_id = models.CharField(max_length=100, null=False, blank=False)  # REQUIRED!
    thread_id = models.CharField(max_length=100, null=True, blank=True)
    message_id = models.CharField(max_length=100, null=True, blank=True)
    run_id = models.CharField(max_length=100, null=True, blank=True)
    openai_model = models.CharField(max_length=100, null=True, blank=True)

    reasoning = models.TextField(blank=True, null=True)
    schema = models.JSONField(blank=True, null=True)  # validated and parsed schema

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
