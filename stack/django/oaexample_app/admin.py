

####OBJECT-ACTIONS-ADMIN_IMPORTS-STARTS####
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import EventCheckins, InviteLinks
from .models import Events
from .models import Friendships
from .models import Invites
from .models import Likes
from .models import Playlists
from .models import SongRequests
from .models import Songs
from .models import Users


####OBJECT-ACTIONS-ADMIN_IMPORTS-ENDS####
from .models import AppTokens
from django.utils.html import format_html

####OBJECT-ACTIONS-ADMIN_MODELS-STARTS####
class UsersAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Additional Info'), {'fields': ('phone', 'profile_picture', 'birthday', 'gender', 'last_known_location', 'link_ig', 'link_spotify', 'link_apple')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'profile_picture', 'birthday', 'gender', 'last_known_location', 'link_ig', 'link_spotify', 'link_apple'),
        }),
    )
    def image_tag(self, obj):
        if obj.profile_picture:
            return format_html('<div style="width: 100px; height: 100px; background-image: url({}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>',
               obj.profile_picture.url)
        return "No Image"

    list_display = ('id', 'username', 'get_full_name', 'profile_picture', 'image_tag')


admin.site.register(Users, UsersAdmin)

class SongsAdmin(admin.ModelAdmin):
    search_fields = ['name', 'artist']
    readonly_fields = ('id',)

admin.site.register(Songs, SongsAdmin)

class PlaylistsAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'social_source', 'name', 'event')

admin.site.register(Playlists, PlaylistsAdmin)

class EventsAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    search_fields = ['name', 'starts', 'ends']
    autocomplete_fields = ['author', 'cohosts']
    list_display = ('id', 'name', 'author', 'starts', 'ends')

admin.site.register(Events, EventsAdmin)

class FriendshipsAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    autocomplete_fields = ['author', 'recipient']
    list_display = ('id', 'author', 'recipient', 'status')

admin.site.register(Friendships, FriendshipsAdmin)

class InvitesAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    autocomplete_fields = ['event', 'author', 'recipient']
    list_display = ('id', 'author', 'recipient', 'event', 'status')


admin.site.register(Invites, InvitesAdmin)

class InviteLinksAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    autocomplete_fields = ['event', 'author']
    list_display = ('id', 'url_alias', 'author', 'event', 'status', 'used')

admin.site.register(InviteLinks, InviteLinksAdmin)

class SongRequestsAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    autocomplete_fields = ['event', 'author', 'song']
    list_display = ('id', 'song', 'event', 'status')

admin.site.register(SongRequests, SongRequestsAdmin)

class EventCheckinsAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)

admin.site.register(EventCheckins, EventCheckinsAdmin)

class LikesAdmin(admin.ModelAdmin):
    readonly_fields = ('id',)
    list_display = ('id', 'author', 'type', 'created_at')

admin.site.register(Likes, LikesAdmin)
####OBJECT-ACTIONS-ADMIN_MODELS-ENDS####


class AppTokensAdmin(admin.ModelAdmin):
    readonly_fields = ()
admin.site.register(AppTokens, AppTokensAdmin)






















































































































































