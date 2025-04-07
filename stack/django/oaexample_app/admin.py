# admin.py

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.contrib.admin.views.main import ChangeList
import django_filters
from .admin_mixins import SmartAdminMixin

# Import your models here
from .models import (
    Topics, ResourceTypes, MeetingTypes, States, Parties, Stakeholders,
    Resources, Users, Cities, Officials, Rallies, ActionPlans, Meetings,
    Invites, Subscriptions, Rooms, Attendees, AppTokens
)


# Custom pagination for large datasets
class LargeTablePaginator(admin.AdminSite):
    # Set higher page sizes with more options
    list_per_page = 50
    list_max_show_all = 1000


# Base admin class with common improvements
class BaseModelAdmin(SmartAdminMixin, admin.ModelAdmin):
    # Better pagination
    list_per_page = 50
    show_full_result_count = False  # Prevents COUNT queries on large tables

    class Media:
        css = { 'all': ('admin/css/admin_enhancements.css',) }
        js = ('admin/js/admin_enhancements.js',)


# Custom ChangeList to optimize queries
class OptimizedChangeList(ChangeList):
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Only select the fields we need for the list display
        if self.list_display:
            required_fields = set(self.list_display)
            if 'id' not in required_fields:
                required_fields.add('id')
            qs = qs.only(*required_fields)
        return qs


class TopicsAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'name', 'image_tag')
    search_fields = ('name',)

    def image_tag(self, obj):
        if obj.icon:
            return format_html(
                '<div style="width: 50px; height: 50px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
                obj.icon.url)
        return "No Image"

    image_tag.short_description = 'Icon'

    def get_changelist(self, request, **kwargs):
        return OptimizedChangeList


admin.site.register(Topics, TopicsAdmin)


class ResourceTypesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'name', 'created_at', 'modified_at')
    search_fields = ('name',)


admin.site.register(ResourceTypes, ResourceTypesAdmin)


class MeetingTypesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'name', 'created_at', 'modified_at')
    search_fields = ('name',)


admin.site.register(MeetingTypes, MeetingTypesAdmin)


class StatesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'name', 'state_code', 'population', 'city_count')
    # list_filter = ('city_count', ('population', django_filters.RangeFilter))
    search_fields = ('name', 'state_code')

    def image_tag(self, obj):
        if obj.icon:
            return format_html(
                '<div style="width: 50px; height: 50px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
                obj.icon.url)
        return "No Image"

    image_tag.short_description = 'Icon'

    # Optimize FK loading - needed for list_select_related
    autocomplete_fields = ['largest_city', 'smallest_city', 'fastest_growing_city']
    list_select_related = ('largest_city', 'smallest_city')


admin.site.register(States, StatesAdmin)


class PartiesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'name', 'image_tag', 'website')
    search_fields = ('name',)

    def image_tag(self, obj):
        if obj.logo:
            return format_html(
                '<div style="width: 50px; height: 50px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
                obj.logo.url)
        return "No Image"

    image_tag.short_description = 'Logo'


admin.site.register(Parties, PartiesAdmin)


class StakeholdersAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'name', 'image_tag', 'created_at')
    search_fields = ('name',)

    def image_tag(self, obj):
        if obj.image:
            return format_html(
                '<div style="width: 50px; height: 50px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
                obj.image.url)
        return "No Image"

    image_tag.short_description = 'Image'


admin.site.register(Stakeholders, StakeholdersAdmin)


class ResourcesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'title', 'price_ccoin', 'resource_type_display')
    search_fields = ('title', 'postal_address')
    list_filter = ('price_ccoin', 'resource_type')

    # Autocomplete for cities and resource types
    autocomplete_fields = ['cities', 'resource_type']

    def image_tag(self, obj):
        if obj.image:
            return format_html(
                '<div style="width: 50px; height: 50px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
                obj.image.url)
        return "No Image"

    image_tag.short_description = 'Image'

    def resource_type_display(self, obj):
        return ", ".join([rt.name for rt in obj.resource_type.all()[:3]])

    resource_type_display.short_description = 'Resource Types'


admin.site.register(Resources, ResourcesAdmin)


class UsersAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Additional Info'), {'fields': ('phone', 'website', 'bio', 'picture', 'cover_photo')}),
        (_('Resources'), {'fields': ('resources',), 'classes': ('collapse',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'website', 'bio', 'picture', 'cover_photo'),
        }),
    )

    # Use autocomplete for many-to-many fields
    autocomplete_fields = ['resources', 'groups']

    list_display = ('id', 'image_tag', 'username', 'email', 'get_full_name', 'display_groups', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone')

    def display_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()[:3]])

    display_groups.short_description = 'Groups'

    def image_tag(self, obj):
        if obj.picture:
            return format_html(
                '<div style="width: 50px; height: 50px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
                obj.picture.url)
        return "No Image"

    image_tag.short_description = 'Picture'

    # Faster loading when displaying user lists
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('groups')


admin.site.register(Users, UsersAdmin)


class CitiesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id',  'image_tag', 'name', 'state_display', 'population', 'county')
    # list_filter = ('state_id', ('population', django_filters.RangeFilter))
    search_fields = ('name', 'county', 'postal_address')

    # Autocomplete for many-to-many fields and foreign keys
    autocomplete_fields = ['state_id', 'sponsors', 'officials']

    def image_tag(self, obj):
        if obj.picture:
            return format_html(
                '<div style="width: 50px; height: 50px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
                obj.picture.url)
        return "No Image"

    image_tag.short_description = 'Image'

    def state_display(self, obj):
        if obj.state_id:
            return f"{obj.state_id.name} ({obj.state_id.state_code})"
        return "-"

    state_display.short_description = 'State'

    # Efficient loading of related fields
    list_select_related = ('state_id',)


admin.site.register(Cities, CitiesAdmin)


class OfficialsAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'title', 'office_phone', 'office_email', 'party_display', 'city_display')
    search_fields = ('title', 'office_email', 'office_phone')
    list_filter = ('party_affiliation',)

    # Autocomplete for many-to-many fields and foreign keys
    autocomplete_fields = ['party_affiliation', 'city']

    def party_display(self, obj):
        if obj.party_affiliation:
            return obj.party_affiliation.name
        return "-"

    party_display.short_description = 'Party'

    def city_display(self, obj):
        return ", ".join([city.name for city in obj.city.all()[:3]])

    city_display.short_description = 'Cities'

    # Efficient loading of related fields
    list_select_related = ('party_affiliation',)


admin.site.register(Officials, OfficialsAdmin)


class RalliesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'title', 'created_at', 'topics_display')
    search_fields = ('title', 'description')

    # Autocomplete for many-to-many fields
    autocomplete_fields = ['topics']

    def topics_display(self, obj):
        return ", ".join([topic.name for topic in obj.topics.all()[:3]])

    topics_display.short_description = 'Topics'


admin.site.register(Rallies, RalliesAdmin)


class ActionPlansAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'title', 'rally_display', 'created_at')
    search_fields = ('title', 'recommendation', 'exe_summary')

    # Autocomplete for many-to-many fields and foreign keys
    autocomplete_fields = ['coauthors', 'rally']

    def rally_display(self, obj):
        if obj.rally:
            return obj.rally.title
        return "-"

    rally_display.short_description = 'Rally'

    # Efficient loading of related fields
    list_select_related = ('rally',)


admin.site.register(ActionPlans, ActionPlansAdmin)


class MeetingsAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'title', 'start', 'end', 'meeting_type_display', 'rally_display')
    list_filter = ('meeting_type', 'start')
    search_fields = ('title', 'address')
    date_hierarchy = 'start'

    # Autocomplete for many-to-many fields and foreign keys
    autocomplete_fields = ['rally', 'meeting_type', 'speakers', 'moderators', 'sponsors']

    def meeting_type_display(self, obj):
        if obj.meeting_type:
            return obj.meeting_type.name
        return "-"

    meeting_type_display.short_description = 'Meeting Type'

    def rally_display(self, obj):
        if obj.rally:
            return obj.rally.title
        return "-"

    rally_display.short_description = 'Rally'

    # Efficient loading of related fields
    list_select_related = ('rally', 'meeting_type')


admin.site.register(Meetings, MeetingsAdmin)


class InvitesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'meeting_display', 'user_display', 'invited_by_display', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('meeting__title', 'user__username', 'invited_by__username')

    # Autocomplete for foreign keys
    autocomplete_fields = ['meeting', 'user', 'invited_by']

    def meeting_display(self, obj):
        if obj.meeting:
            return obj.meeting.title
        return "-"

    meeting_display.short_description = 'Meeting'

    def user_display(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return "-"

    user_display.short_description = 'User'

    def invited_by_display(self, obj):
        if obj.invited_by:
            return obj.invited_by.get_full_name() or obj.invited_by.username
        return "-"

    invited_by_display.short_description = 'Invited By'

    # Efficient loading of related fields
    list_select_related = ('meeting', 'user', 'invited_by')


admin.site.register(Invites, InvitesAdmin)


class SubscriptionsAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'subscriber_display', 'rally_display', 'meeting_display', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('subscriber__username', 'rally__title', 'meeting__title')

    # Autocomplete for foreign keys
    autocomplete_fields = ['subscriber', 'rally', 'meeting']

    def subscriber_display(self, obj):
        if obj.subscriber:
            return obj.subscriber.get_full_name() or obj.subscriber.username
        return "-"

    subscriber_display.short_description = 'Subscriber'

    def rally_display(self, obj):
        if obj.rally:
            return obj.rally.title
        return "-"

    rally_display.short_description = 'Rally'

    def meeting_display(self, obj):
        if obj.meeting:
            return obj.meeting.title
        return "-"

    meeting_display.short_description = 'Meeting'

    # Efficient loading of related fields
    list_select_related = ('subscriber', 'rally', 'meeting')


admin.site.register(Subscriptions, SubscriptionsAdmin)


class RoomsAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'author_display', 'start', 'end', 'privacy', 'status', 'rally_display', 'meeting_display')
    list_filter = ('status', 'privacy')
    search_fields = ('rally__title', 'meeting__title', 'author__username')
    date_hierarchy = 'start'

    # Autocomplete for foreign keys
    autocomplete_fields = ['author', 'rally', 'meeting']

    def author_display(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return "-"

    author_display.short_description = 'Owner'

    def rally_display(self, obj):
        if obj.rally:
            return obj.rally.title
        return "-"

    rally_display.short_description = 'Rally'

    def meeting_display(self, obj):
        if obj.meeting:
            return obj.meeting.title
        return "-"

    meeting_display.short_description = 'Meeting'

    # Efficient loading of related fields
    list_select_related = ('author', 'rally', 'meeting')


admin.site.register(Rooms, RoomsAdmin)


class AttendeesAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'display_name', 'room_display', 'role', 'sharing_audio', 'sharing_video')
    list_filter = ('role', 'sharing_audio', 'sharing_video', 'hand_raised')
    search_fields = ('display_name', 'room_id__chat_thread')

    # Autocomplete for foreign keys
    autocomplete_fields = ['room_id']

    def image_tag(self, obj):
        if obj.display_bg:
            return format_html(
                '<div style="width: 50px; height: 50px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
                obj.display_bg.url)
        return "No Image"

    image_tag.short_description = 'Background'

    def room_display(self, obj):
        if obj.room_id:
            if obj.room_id.rally:
                return f"Rally: {obj.room_id.rally.title}"
            elif obj.room_id.meeting:
                return f"Meeting: {obj.room_id.meeting.title}"
            return f"Room: {obj.room_id.id}"
        return "-"

    room_display.short_description = 'Room'

    # Efficient loading of related fields
    list_select_related = ('room_id', 'room_id__rally', 'room_id__meeting')


admin.site.register(Attendees, AttendeesAdmin)


class AppTokensAdmin(BaseModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'author_display', 'provider', 'expires_at')
    list_filter = ('provider',)
    search_fields = ('author__username',)

    # Autocomplete for foreign keys
    autocomplete_fields = ['author']

    def author_display(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return "-"

    author_display.short_description = 'User'

    # Efficient loading of related fields
    list_select_related = ('author',)


admin.site.register(AppTokens, AppTokensAdmin)
