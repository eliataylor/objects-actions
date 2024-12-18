

####OBJECT-ACTIONS-ADMIN_IMPORTS-STARTS####
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
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
####OBJECT-ACTIONS-ADMIN_IMPORTS-ENDS####
from .models import AppTokens
from django.utils.html import format_html

####OBJECT-ACTIONS-ADMIN_MODELS-STARTS####
class TopicsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Topics, TopicsAdmin)

class ResourceTypesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(ResourceTypes, ResourceTypesAdmin)

class MeetingTypesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(MeetingTypes, MeetingTypesAdmin)

class StatesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(States, StatesAdmin)

class PartiesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Parties, PartiesAdmin)

class StakeholdersAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Stakeholders, StakeholdersAdmin)

class ResourcesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Resources, ResourcesAdmin)

class UsersAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Additional Info'), {'fields': ('phone', 'website', 'bio', 'picture', 'cover_photo', 'resources')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'website', 'bio', 'picture', 'cover_photo', 'resources'),
        }),
    )                


admin.site.register(Users, UsersAdmin)

class CitiesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Cities, CitiesAdmin)

class OfficialsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Officials, OfficialsAdmin)

class RalliesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Rallies, RalliesAdmin)

class ActionPlansAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(ActionPlans, ActionPlansAdmin)

class MeetingsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Meetings, MeetingsAdmin)

class InvitesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Invites, InvitesAdmin)

class SubscriptionsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Subscriptions, SubscriptionsAdmin)

class RoomsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Rooms, RoomsAdmin)

class AttendeesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Attendees, AttendeesAdmin)
####OBJECT-ACTIONS-ADMIN_MODELS-ENDS####


class AppTokensAdmin(admin.ModelAdmin):
    readonly_fields = ()
admin.site.register(AppTokens, AppTokensAdmin)
























































































































































































































































































