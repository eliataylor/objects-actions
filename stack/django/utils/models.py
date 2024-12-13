import datetime
import uuid
from typing import List, Tuple, Type

from django.db import models
from django.db.models import ForeignKey, ManyToManyField, ManyToOneRel
from django.utils import timezone


def bump_related_objects(model: Type[models.Model], ids: List[int], updated_at: datetime.datetime):
    if not ids:
        return

    bump_related = getattr(model, "bump_related", ())
    if not bump_related:
        return

    for field_name in bump_related:
        field = model._meta.get_field(field_name)
        if isinstance(field, ForeignKey):
            parents_qs = field.related_model.objects.filter(
                id__in=model.objects.filter(pk__in=ids).values(field.attname)
            )
        elif isinstance(field, ManyToOneRel):
            parents_qs = field.related_model.objects.filter(
                **{f"{field.remote_field.attname}__in": ids},
            )
        elif isinstance(field, ManyToManyField):
            parents_qs = field.related_model.objects.filter(
                **{f"{field.remote_field.name}__in": model.objects.filter(pk__in=ids).only(model._meta.pk.name)},
            )
        else:
            raise NotImplementedError
        parent_ids = list(parents_qs.filter(updated_at__lt=updated_at).values_list("id", flat=True))
        field.related_model.objects.filter(id__in=parent_ids).update(updated_at=updated_at)
        bump_related_objects(field.related_model, parent_ids, updated_at)


def bump_instance_related_objects(instance: models.Model, delete: bool = False):
    updated_at = timezone.now() if delete else getattr(instance, "updated_at")
    bump_related_objects(type(instance), [instance.pk], updated_at)
    if not delete:
        # Clear cached relations.
        for field in instance._meta.concrete_fields:
            if field.is_relation and field.is_cached(instance):
                field.delete_cached_value(instance)


class BumpParentsModelMixin:
    bump_related: Tuple[str, ...] = ()

    def save(self, *args, **kwargs) -> None:
        super().save(*args, **kwargs)
        if isinstance(self, models.Model):
            if hasattr(self, "bump_related") and self.bump_related:
                bump_instance_related_objects(self)

    def delete(self, *args, **kwargs):
        if hasattr(self, "bump_related") and self.bump_related:
            bump_instance_related_objects(self, delete=True)
        super().delete(*args, **kwargs)


class TimedModel(BumpParentsModelMixin, models.Model):
    """An abstract class for models with created/updated information."""

    created_at = models.DateTimeField(
        db_index=True,
        auto_now_add=True,
        editable=False,
    )
    updated_at = models.DateTimeField(
        db_index=True,
        auto_now=True,
        editable=False,
    )

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """An abstract class for models with uuid field."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class ShortNameModel(models.Model):
    """An abstract class for models with short name field."""

    name = models.CharField(max_length=64)

    class Meta:
        abstract = True


class LongNameModel(models.Model):
    """An abstract class for models with long name field."""

    name = models.CharField(max_length=128)

    class Meta:
        abstract = True
