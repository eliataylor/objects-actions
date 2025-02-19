import openai
from django.contrib.auth import get_user_model
from django.db import models
from .serializers import sanitize_json

User = get_user_model()

class SpreadsheetDefinition(models.Model):
    prompt = models.CharField(max_length=255)
    response = models.CharField(max_length=4000)
    schema = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name='+')

    class Meta:
        abstract = False
        verbose_name = "Spreadsheet Builder"
        verbose_name_plural = "Spreadsheet Builders"

    def __str__(self):
        return f"{self.prompt}"

    def save(self, *args, **kwargs):
        # Ensure JSON compatibility before saving
        if self.schema:
            self.schema = sanitize_json(self.schema)

        super().save(*args, **kwargs)

