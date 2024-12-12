

####OBJECT-ACTIONS-SERIALIZER-IMPORTS-STARTS####
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import ManyToManyField
from .models import Users
from .models import Songs
from .models import Playlists
from .models import Events
from .models import Friendships
from .models import Invites
from .models import SongRequests
from .models import EventCheckins
from .models import Likes
####OBJECT-ACTIONS-SERIALIZER-IMPORTS-ENDS####



####OBJECT-ACTIONS-SERIALIZERS-STARTS####
class SubFieldRelatedField(serializers.PrimaryKeyRelatedField):
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
class UsersSerializer(CustomSerializer):
    class Meta:
        model = Users
        fields = [field.name for field in Users._meta.fields if field.name not in ('password', 'email')]
class SongsSerializer(CustomSerializer):
    class Meta:
        model = Songs
        fields = '__all__'
class PlaylistsSerializer(CustomSerializer):
    class Meta:
        model = Playlists
        fields = '__all__'
class EventsSerializer(CustomSerializer):
    class Meta:
        model = Events
        fields = '__all__'
class FriendshipsSerializer(CustomSerializer):
    class Meta:
        model = Friendships
        fields = '__all__'
class InvitesSerializer(CustomSerializer):
    class Meta:
        model = Invites
        fields = '__all__'
class SongRequestsSerializer(CustomSerializer):
    class Meta:
        model = SongRequests
        fields = '__all__'
class EventCheckinsSerializer(CustomSerializer):
    class Meta:
        model = EventCheckins
        fields = '__all__'
class LikesSerializer(CustomSerializer):
    class Meta:
        model = Likes
        fields = '__all__'
####OBJECT-ACTIONS-SERIALIZERS-ENDS####


# serializers.py

class PhoneNumberSerializer(serializers.Serializer):
    phone = serializers.CharField()

class VerifyPhoneSerializer(serializers.Serializer):
    phone = serializers.CharField()
    code = serializers.CharField()












































































