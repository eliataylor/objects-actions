####OBJECT-ACTIONS-SERIALIZER-IMPORTS-STARTS####
import logging

from django.db.models import ImageField
from rest_framework import serializers

from .models import EventCheckins, InviteLinks
from .models import Events
from .models import Friendships
from .models import Invites
from .models import Likes
from .models import Playlists
from .models import SongRequests
from .models import Songs
from .models import Users

####OBJECT-ACTIONS-SERIALIZER-IMPORTS-ENDS####

logger = logging.getLogger(__name__)
from django.contrib.auth import get_user_model
from django.core.exceptions import FieldDoesNotExist
from google.auth.exceptions import DefaultCredentialsError

####OBJECT-ACTIONS-SERIALIZERS-STARTS####

from django.db.models import Q

class CustomSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        if self.has_field("author"):
            request = self.context.get('request', None)
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                validated_data['author'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if self.has_field("author") and instance.author is None:
            request = self.context.get('request', None)
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                validated_data['author'] = request.user
        return super().update(instance, validated_data)

    def has_field(self, field_name):
        model = self.Meta.model
        try:
            model._meta.get_field(field_name)
            return True
        except FieldDoesNotExist:
            return False

    def get_serializer_class_for_instance(self, instance):
        # Construct the serializer class name
        serializer_class_name = f"{instance.__class__.__name__}Serializer"
        # Fetch the serializer class from globals
        serializer_class = globals().get(serializer_class_name)
        if not serializer_class:
            raise ValueError(f"Serializer class {serializer_class_name} not found")
        return serializer_class

    def normalize_instance(self, related_instance, base_field):
        relEntity = {
            "id": related_instance.pk,
            "str": str(related_instance),
            "_type": related_instance.__class__.__name__,
            "entity" : {}
        }

        if isinstance(related_instance, get_user_model()):
            relEntity['entity']['full_name'] = related_instance.getName()

        request = self.context.get('request')
        if request:
            subentities = request.query_params.getlist('getrelated', [])
            subfields = request.query_params.getlist('subfields', [])
        else:
            subentities = []
            subfields = []

        if base_field.lower() in subentities:
            serializer_class = self.get_serializer_class_for_instance(related_instance)
            serializer = serializer_class(related_instance, context=self.context)
            relEntity['entity'] = serializer.data
        else:
            for sub_field in related_instance._meta.get_fields():
                if sub_field.name in subfields:
                    rel_field = getattr(related_instance, sub_field.name)
                    relEntity['entity'][sub_field.name] = str(rel_field)
                elif isinstance(sub_field, ImageField):
                    image_field = getattr(related_instance, sub_field.name)
                    if image_field:
                        try:
                            relEntity['img'] = image_field.url
                            break
                        except DefaultCredentialsError:
                            relEntity['img'] = None
                            logger.error(f" Google Cloud credentials not found. Trying to access {sub_field.name}")
                elif sub_field.name == 'remote_image':
                    relEntity['img'] = getattr(related_instance, sub_field.name)

        if len(relEntity['entity']) == 0:
            del relEntity['entity']

        return relEntity

    def to_representation(self, instance):
        # Get the original representation
        representation = super().to_representation(instance)
        # Add the model type
        representation['_type'] = instance.__class__.__name__

        for field in self.Meta.model._meta.get_fields():
            if field.is_relation and hasattr(instance, field.name):
                field_name = field.name

                if field.many_to_one:
                    related_instance = getattr(instance, field_name)
                    if related_instance is not None:
                        representation[field_name] = self.normalize_instance(related_instance, field_name)

                elif field.many_to_many:
                    related_instance = getattr(instance, field_name)
                    related_instances = related_instance.all()
                    representation[field_name] = []
                    for related in related_instances:
                        representation[field_name].append(self.normalize_instance(related, field_name) )

        return representation

class UsersSerializer(CustomSerializer):
    class Meta:
        model = Users
        fields = [field.name for field in Users._meta.fields if field.name not in ('password', 'email')]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['username'] = instance.username
        representation['full_name'] = instance.get_full_name()

        return representation

class SongsSerializer(CustomSerializer):
    class Meta:
        model = Songs
        fields = ['name', 'author', 'id', 'spotify_id', 'apple_id', 'artist', 'remote_image', 'playlist']


class PlaylistsSerializer(CustomSerializer):
    class Meta:
        model = Playlists
        fields = '__all__'

class InvitesSerializer(CustomSerializer):
    class Meta:
        model = Invites
        fields = '__all__'

    def validate_status(self, status_want):
        request = self.context.get('request')
        instance = getattr(self, 'instance', None)

        if instance: # (for updates or partial updates)
            event = instance.event  # Use the referenced Event object
            canManage = request.user == event.author or request.user in event.cohosts.all()

            if not canManage:
                has_friendship = Friendships.objects.filter(
                    Q(status="accepted") &
                    (
                            (Q(author=request.user) & (
                                    Q(recipient__in=event.cohosts.all()) | Q(recipient=event.author))) |
                            (Q(recipient=request.user) & (
                                    Q(author__in=event.cohosts.all()) | Q(author=event.author)))
                    )
                ).first()

                if status_want == 'requested' and has_friendship:
                    status_want = 'accepted'

                if status_want == 'accepted' and not has_friendship:
                    status_want = 'requested'

        return status_want

class InviteLinksSerializer(CustomSerializer):
    class Meta:
        model = InviteLinks
        fields = '__all__'
class EventsSerializer(CustomSerializer):
    # invites = InvitesSerializer(many=True, read_only=True)
    class Meta:
        model = Events
        fields = '__all__'
        # fields = ['id', 'author', 'created_at', 'modified_at', 'cohosts', 'url_alias', 'name', 'starts', 'ends', 'cover', 'description', 'address', 'coordinates', 'invites']
class FriendshipsSerializer(CustomSerializer):
    class Meta:
        model = Friendships
        fields = '__all__'
class SongRequestsSerializer(CustomSerializer):
    likes_count = serializers.IntegerField(read_only=True)
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
