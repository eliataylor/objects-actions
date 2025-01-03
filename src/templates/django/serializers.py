class CustomUserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        # Get the original representation
        representation = super().to_representation(instance)
        # Add the model type
        representation['_type'] = instance.__class__.__name__

        for field in self.Meta.model._meta.get_fields():
            if field.is_relation and hasattr(instance, field.name):
                field_name = field.name
                related_instance = getattr(instance, field_name)

                if field.many_to_one:
                    if related_instance is not None:
                        representation[field_name] = {
                            "id": related_instance.pk,
                            "str": str(related_instance),
                            "_type": related_instance.__class__.__name__,
                        }

                elif field.many_to_many:
                    related_instances = related_instance.all()
                    representation[field_name] = [
                        {
                            "id": related.pk,
                            "str": str(related),
                            "_type": related.__class__.__name__,
                        } for related in related_instances
                    ]
        return representation

class CustomSerializer(serializers.ModelSerializer):
    # serializer_related_field = SubFieldRelatedField
    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if 'author' in self.Meta.model._meta.get_fields():
                validated_data['author'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if 'author' in self.Meta.model._meta.get_fields():
                validated_data['author'] = request.user
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        # Get the original representation
        representation = super().to_representation(instance)
        # Add the model type
        representation['_type'] = instance.__class__.__name__

        for field in self.Meta.model._meta.get_fields():
            if field.is_relation and hasattr(instance, field.name):
                field_name = field.name
                related_instance = getattr(instance, field_name)

                if field.many_to_one:
                    if related_instance is not None:
                        representation[field_name] = {
                            "id": related_instance.pk,
                            "str": str(related_instance),
                            "_type": related_instance.__class__.__name__,
                        }

                elif field.many_to_many:
                    related_instances = related_instance.all()
                    representation[field_name] = [
                        {
                            "id": related.pk,
                            "str": str(related),
                            "_type": related.__class__.__name__,
                        } for related in related_instances
                    ]
        return representation
