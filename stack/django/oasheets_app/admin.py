from django.contrib import admin

from .models import SchemaVersions, ProjectSchema


class SchemaVersionsAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'privacy', 'prompt', 'assistant_id', 'thread_id', 'parent', 'created_at', 'versions_count')


admin.site.register(SchemaVersions, SchemaVersionsAdmin)


class ProjectSchemaAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'title', 'author')


admin.site.register(ProjectSchema, ProjectSchemaAdmin)
