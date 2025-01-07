####OBJECT-ACTIONS-SERIALIZER-IMPORTS-STARTS####
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import ManyToManyField
from .models import Topics
from .models import ResourceTypes
from .models import MeetingTypes
from .models import States
from .models import Parties
from .models import Stakeholders
from .models import Resources
from .models import Users
from .models import Cities
from .models import Officials
from .models import Rallies
from .models import ActionPlans
from .models import Meetings
from .models import Invites
from .models import Subscriptions
from .models import Rooms
from .models import Attendees
####OBJECT-ACTIONS-SERIALIZER-IMPORTS-ENDS####

####OBJECT-ACTIONS-SERIALIZERS-STARTS####
class CustomUsersSerializer(serializers.ModelSerializer):
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