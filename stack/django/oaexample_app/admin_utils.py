# Add this to a separate file like admin_utils.py

from django.contrib.admin.widgets import AutocompleteSelect
from django.core.cache import cache
from django.db import connection
from django.forms import ModelChoiceField, Select, SelectMultiple


class ConditionalAutocompleteSelect(AutocompleteSelect):
    """
    A widget that switches between regular select and autocomplete
    based on the model's record count
    """

    def __init__(self, rel, admin_site, attrs=None, choices=(), using=None, threshold=20):
        super().__init__(rel, admin_site, attrs, choices, using)
        self.threshold = threshold
        self._use_autocomplete = None
        self._choices_list = None
        self.model = rel.model

    @property
    def use_autocomplete(self):
        if self._use_autocomplete is None:
            count = self.get_model_count()
            self._use_autocomplete = count > self.threshold
        return self._use_autocomplete

    def get_model_count(self):
        """Get cached count of model instances"""
        cache_key = f"admin_model_count_{self.model._meta.app_label}_{self.model._meta.model_name}"
        count = cache.get(cache_key)

        if count is None:
            # Use raw SQL for faster counting on very large tables
            table_name = self.model._meta.db_table
            cursor = connection.cursor()
            cursor.execute(f"SELECT COUNT(*) FROM {connection.ops.quote_name(table_name)}")
            count = cursor.fetchone()[0]

            # Cache for 5 minutes
            cache.set(cache_key, count, 300)

        return count

    def get_choices(self):
        """Get and cache the choices for small datasets"""
        if not self.use_autocomplete and self._choices_list is None:
            self._choices_list = list(super().get_choices())
        return self._choices_list if not self.use_autocomplete else super().get_choices()

    def render(self, name, value, attrs=None, renderer=None):
        if not self.use_autocomplete:
            # For small datasets, use regular select box
            select = Select(choices=self.get_choices())
            return select.render(name, value, attrs, renderer)

        # For large datasets, use autocomplete
        return super().render(name, value, attrs, renderer)


class ConditionalAutocompleteSelectMultiple(ConditionalAutocompleteSelect):
    """Multiple select version of the conditional autocomplete"""

    def render(self, name, value, attrs=None, renderer=None):
        if not self.use_autocomplete:
            # For small datasets, use regular select box
            select = SelectMultiple(choices=self.get_choices())
            return select.render(name, value, attrs, renderer)

        # For large datasets, use autocomplete
        return super().render(name, value, attrs, renderer)


class SmartModelChoiceField(ModelChoiceField):
    """A model choice field that automatically determines whether to use autocomplete"""

    def __init__(self, queryset, *, admin_site=None, threshold=20, **kwargs):
        super().__init__(queryset, **kwargs)
        self.admin_site = admin_site
        self.threshold = threshold

        # Configure widget based on record count
        rel = self.queryset.model._meta.get_field(self.to_field_name or 'pk').remote_field
        self.widget = ConditionalAutocompleteSelect(
            rel, admin_site, threshold=threshold
        )


class SmartModelMultipleChoiceField(ModelChoiceField):
    """A model multiple choice field that automatically determines whether to use autocomplete"""

    def __init__(self, queryset, *, admin_site=None, threshold=20, **kwargs):
        super().__init__(queryset, **kwargs)
        self.admin_site = admin_site
        self.threshold = threshold

        # Configure widget based on record count
        rel = self.queryset.model._meta.get_field(self.to_field_name or 'pk').remote_field
        self.widget = ConditionalAutocompleteSelectMultiple(
            rel, admin_site, threshold=threshold
        )


# Usage in admin.py

from .admin_utils import SmartModelChoiceField, SmartModelMultipleChoiceField


class SmartAutocompleteAdminMixin:
    """
    Admin mixin that automatically uses conditional autocomplete for fields.
    """
    autocomplete_threshold = 20  # Default threshold

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Override to use SmartModelChoiceField for foreign keys"""
        # Get bases of this class without this mixin
        parent_classes = [cls for cls in self.__class__.__bases__
                          if cls != SmartAutocompleteAdminMixin]

        # Check if field should use autocomplete
        if db_field.name in getattr(self, 'autocomplete_fields', []):
            kwargs['form_class'] = SmartModelChoiceField
            kwargs['admin_site'] = self.admin_site
            kwargs['threshold'] = getattr(self, 'autocomplete_threshold', 20)

            # Call parent's formfield_for_foreignkey (skipping this mixin)
            for parent_cls in parent_classes:
                if hasattr(parent_cls, 'formfield_for_foreignkey'):
                    return parent_cls.formfield_for_foreignkey(self, db_field, request, **kwargs)

        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        """Override to use SmartModelMultipleChoiceField for many-to-many fields"""
        # Get bases of this class without this mixin
        parent_classes = [cls for cls in self.__class__.__bases__
                          if cls != SmartAutocompleteAdminMixin]

        # Check if field should use autocomplete
        if db_field.name in getattr(self, 'autocomplete_fields', []):
            kwargs['form_class'] = SmartModelMultipleChoiceField
            kwargs['admin_site'] = self.admin_site
            kwargs['threshold'] = getattr(self, 'autocomplete_threshold', 20)

            # Call parent's formfield_for_manytomany (skipping this mixin)
            for parent_cls in parent_classes:
                if hasattr(parent_cls, 'formfield_for_manytomany'):
                    return parent_cls.formfield_for_manytomany(self, db_field, request, **kwargs)

        return super().formfield_for_manytomany(db_field, request, **kwargs)
