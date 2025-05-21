from functools import lru_cache

from django.forms import Select


class SmartAdminMixin:
    """
    A mixin that automatically switches between Select and Autocomplete
    widgets based on the number of available objects.
    """
    autocomplete_threshold = 20  # Switch to autocomplete when more than this many objects

    @lru_cache(maxsize=128)
    def get_object_count(self, model):
        """Count objects in model, with caching for performance"""
        return model.objects.count()

    def get_form(self, request, obj=None, change=False, **kwargs):
        form = super().get_form(request, obj, change, **kwargs)

        # Original fields configuration
        original_autocomplete = getattr(self, 'autocomplete_fields', [])

        # Start with empty autocomplete fields
        self.autocomplete_fields = []

        # Process each field that might need autocomplete
        for field_name in original_autocomplete:
            field = form.base_fields.get(field_name)
            if not field:
                continue

            # Get the related model
            related_model = field.queryset.model

            # Check the number of objects
            if self.get_object_count(related_model) > self.autocomplete_threshold:
                # Use autocomplete for this field
                self.autocomplete_fields.append(field_name)
            else:
                # For small datasets, use regular select with pre-populated choices
                field.widget = Select(choices=[(obj.pk, str(obj)) for obj in related_model.objects.all()])

        return form
