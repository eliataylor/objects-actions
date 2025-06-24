####OBJECT-ACTIONS-SERIALIZER-IMPORTS-STARTS####

from django.db.models import ImageField
from rest_framework import serializers
from drf_spectacular.extensions import OpenApiSerializerExtension
from drf_spectacular.plumbing import build_object_type, build_array_type
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema_field

from .models import ActionPlans
from .models import Attendees
from .models import Cities
from .models import Invites
from .models import MeetingTypes
from .models import Meetings
from .models import Officials
from .models import Parties
from .models import Rallies
from .models import ResourceTypes
from .models import Resources
from .models import Rooms
from .models import Stakeholders
from .models import States
from .models import Subscriptions
from .models import Topics
from .models import Users

####OBJECT-ACTIONS-SERIALIZER-IMPORTS-ENDS####
import logging
logger = logging.getLogger(__name__)
from django.core.exceptions import FieldDoesNotExist
from google.auth.exceptions import DefaultCredentialsError


# Custom field classes to represent the transformed relationship objects

class RelationObjectField(serializers.Field):
    """Field that represents a rich relationship object"""
    
    def __init__(self, **kwargs):
        kwargs['read_only'] = True
        super().__init__(**kwargs)
    
    def to_representation(self, value):
        # This should never be called as it's handled by CustomSerializer.to_representation
        return value

class ManyRelationObjectField(serializers.ListField):
    """Field that represents a list of rich relationship objects"""
    
    def __init__(self, **kwargs):
        kwargs['read_only'] = True
        kwargs['child'] = RelationObjectField()
        super().__init__(**kwargs)

# Schema definitions for the relationship objects
RELATION_OBJECT_SCHEMA = {
    'type': 'object',
    'properties': {
        'id': {
            'type': 'integer',
            'description': 'Primary key of the related object'
        },
        'str': {
            'type': 'string',
            'description': 'String representation of the related object'
        },
        '_type': {
            'type': 'string',
            'description': 'Type name of the related object'
        },
        'entity': {
            'type': 'object',
            'additionalProperties': True,
            'description': 'Additional fields based on query parameters',
            'nullable': True
        },
        'img': {
            'type': 'string',
            'format': 'uri',
            'description': 'Image URL if available',
            'nullable': True
        }
    },
    'required': ['id', 'str', '_type']
}

SIMPLE_RELATION_OBJECT_SCHEMA = {
    'type': 'object',
    'properties': {
        'id': {
            'type': 'integer',
            'description': 'Primary key of the related object'
        },
        'str': {
            'type': 'string',
            'description': 'String representation of the related object'
        },
        '_type': {
            'type': 'string',
            'description': 'Type name of the related object'
        }
    },
    'required': ['id', 'str', '_type']
}

# Extend the schema field decorators
@extend_schema_field(RELATION_OBJECT_SCHEMA)
class EnhancedRelationObjectField(RelationObjectField):
    pass

@extend_schema_field({
    'type': 'array',
    'items': RELATION_OBJECT_SCHEMA
})
class EnhancedManyRelationObjectField(ManyRelationObjectField):
    pass

@extend_schema_field(SIMPLE_RELATION_OBJECT_SCHEMA)
class SimpleRelationObjectField(RelationObjectField):
    pass

@extend_schema_field({
    'type': 'array',
    'items': SIMPLE_RELATION_OBJECT_SCHEMA
})
class SimpleManyRelationObjectField(ManyRelationObjectField):
    pass

####OBJECT-ACTIONS-SERIALIZERS-STARTS####
class CustomUsersSerializer(serializers.ModelSerializer):
    # Add _type field to all responses
    _type = serializers.CharField(read_only=True, help_text="Model type name")
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace relationship fields with simple custom fields in the response schema
        if hasattr(self.Meta, 'model'):
            for field in self.Meta.model._meta.get_fields():
                if field.is_relation and not field.auto_created and hasattr(self, 'fields') and field.name in self.fields:
                    if field.many_to_one:
                        # Replace ForeignKey field with our simple custom field
                        self.fields[field.name] = SimpleRelationObjectField(allow_null=True)
                    elif field.many_to_many:
                        # Replace ManyToMany field with our simple custom field
                        self.fields[field.name] = SimpleManyRelationObjectField()

    def to_representation(self, instance):
        # Get the original representation
        representation = super().to_representation(instance)
        # Add the model type
        representation['_type'] = instance.__class__.__name__

        for field in self.Meta.model._meta.get_fields():
            if field.is_relation and not field.auto_created and hasattr(instance, field.name):
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
    # Add _type field to all responses
    _type = serializers.CharField(read_only=True, help_text="Model type name")
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace relationship fields with custom fields in the response schema
        if hasattr(self.Meta, 'model'):
            for field in self.Meta.model._meta.get_fields():
                if field.is_relation and not field.auto_created and hasattr(self, 'fields') and field.name in self.fields:
                    if field.many_to_one:
                        # Replace ForeignKey field with our custom field
                        self.fields[field.name] = EnhancedRelationObjectField(allow_null=True)
                    elif field.many_to_many:
                        # Replace ManyToMany field with our custom field
                        self.fields[field.name] = EnhancedManyRelationObjectField()

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            field_names = [field.name for field in self.Meta.model._meta.get_fields()]
            if 'author' in field_names:
                validated_data['author'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            field_names = [field.name for field in self.Meta.model._meta.get_fields()]
            if 'author' in field_names:
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
            "entity": {}
        }

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
            if field.is_relation and not field.auto_created and hasattr(instance, field.name):
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
                        representation[field_name].append(self.normalize_instance(related, field_name))

        return representation

class TopicsSerializer(CustomSerializer):
    class Meta:
        model = Topics
        fields = '__all__'
class ResourceTypesSerializer(CustomSerializer):
    class Meta:
        model = ResourceTypes
        fields = '__all__'

class MeetingTypesSerializer(CustomSerializer):
    class Meta:
        model = MeetingTypes
        fields = '__all__'
class StatesSerializer(CustomSerializer):
    class Meta:
        model = States
        fields = '__all__'
class PartiesSerializer(CustomSerializer):
    class Meta:
        model = Parties
        fields = '__all__'
class StakeholdersSerializer(CustomSerializer):
    class Meta:
        model = Stakeholders
        fields = '__all__'
class ResourcesSerializer(CustomSerializer):
    class Meta:
        model = Resources
        fields = '__all__'
class UsersSerializer(CustomUsersSerializer):
    class Meta:
        model = Users
        exclude = ('password', 'email', 'is_active', 'is_staff', 'is_superuser')
class CitiesSerializer(CustomSerializer):
    class Meta:
        model = Cities
        fields = '__all__'
class OfficialsSerializer(CustomSerializer):
    class Meta:
        model = Officials
        fields = '__all__'
class RalliesSerializer(CustomSerializer):
    class Meta:
        model = Rallies
        fields = '__all__'
class ActionPlansSerializer(CustomSerializer):
    class Meta:
        model = ActionPlans
        fields = '__all__'
class MeetingsSerializer(CustomSerializer):
    class Meta:
        model = Meetings
        fields = '__all__'
class InvitesSerializer(CustomSerializer):
    class Meta:
        model = Invites
        fields = '__all__'
class SubscriptionsSerializer(CustomSerializer):
    class Meta:
        model = Subscriptions
        fields = '__all__'
class RoomsSerializer(CustomSerializer):
    class Meta:
        model = Rooms
        fields = '__all__'
class AttendeesSerializer(CustomSerializer):
    class Meta:
        model = Attendees
        fields = '__all__'
####OBJECT-ACTIONS-SERIALIZERS-ENDS####


# serializers.py

class PhoneNumberSerializer(serializers.Serializer):
    phone = serializers.CharField()

class VerifyPhoneSerializer(serializers.Serializer):
    phone = serializers.CharField()
    code = serializers.CharField()
