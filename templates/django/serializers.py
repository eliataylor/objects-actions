class SubFieldRelatedField(serializers.PrimaryKeyRelatedField):
    # META >
    # exclude = ()  # Default: empty tuple, no fields excluded
    # depth = 0  # Default: 0, no nested serialization
    # read_only_fields = ()  # Default: empty tuple, no read-only fields
    # write_only_fields = ()  # Default: empty tuple, no write-only fields
    # extra_kwargs = {}  # Default: empty dictionary, no extra field configurations
    # validators = []  # Default: empty list, no validators defined
    # error_messages = {}  # Default: empty dictionary, no custom error messages

    def __init__(self, **kwargs):
        self.slug_field = kwargs.pop('slug_field', None)
        super(SubFieldRelatedField, self).__init__(**kwargs)

    def to_internal_value(self, data):
        if self.pk_field is not None:
            field_label = self.pk_field.label
            if isinstance(data, dict):
                if field_label in data:
                    datag = data[field_label]
                    data = self.pk_field.to_internal_value(datag)
                else:
                    data = self.queryset.model.objects.create(**data)
                    data.save()
                return data
            elif self.slug_field is not None and isinstance(data, str):
                queryset = self.get_queryset()
                args = {self.slug_field: data}
                return queryset.get(**args)
            else:
                data = self.pk_field.to_internal_value(data)
        else:
            if isinstance(data, dict):
                data = self.queryset.model.objects.get_or_create(**data)
                return data
        queryset = self.get_queryset()
        try:
            if isinstance(data, bool):
                raise TypeError
            return queryset.get(pk=data)
        except ObjectDoesNotExist:
            self.fail('does_not_exist', pk_value=data)
        except (TypeError, ValueError):
            self.fail('incorrect_type', data_type=type(data).__name__)

class CustomSerializer(serializers.ModelSerializer):
    serializer_related_field = SubFieldRelatedField

    def to_representation(self, instance):
        # Get the original representation
        representation = super().to_representation(instance)
        # Add the model type
        representation['_type'] = instance.__class__.__name__

        for field in self.Meta.model._meta.fields:
            if field.is_relation and field.many_to_one:
                field_name = field.name
                related_instance = getattr(instance, field_name)
                if related_instance is not None:
                    representation[field_name] = {
                        "id": related_instance.pk,
                        "str": str(related_instance),
                        "_type": related_instance.__class__.__name__,
                    }

        return representation