from django.contrib import admin
from .models import SchemaVersions, PromptConfig

class SchemaVersionsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)
	list_display = ('id', 'privacy', 'prompt', 'assistant_id', 'thread_id', 'parent', 'created_at', 'versions_count')

admin.site.register(SchemaVersions, SchemaVersionsAdmin)

class PromptConfigAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)
	list_display = ('id', 'active', 'assistant_id', 'message_id', 'run_id', 'openai_model')

admin.site.register(PromptConfig, PromptConfigAdmin)
