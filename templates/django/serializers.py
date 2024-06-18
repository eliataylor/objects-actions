class SubFieldRelatedField(serializers.PrimaryKeyRelatedField):
    def __init__(self, **kwargs):
        self.model = kwargs.pop('model', None)
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
                    data = self.model.objects.create(**data)
                    data.save()
                return data
            elif self.slug_field is not None and isinstance(data, str):
                queryset = self.get_queryset()
                args = {self.slug_field: data}
                return queryset.get(**args)
            else:
                data = self.pk_field.to_internal_value(data)
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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Iterate over all fields of the model
        for field_name, field in self.Meta.model._meta.fields_map.items():
            # If the field is a ManyToManyField
            if isinstance(field, ManyToManyField):
                # Set its serializer field to an instance of SubFieldRelatedField
                self.fields[field_name] = SubFieldRelatedField(queryset=field.related_model.objects.all())