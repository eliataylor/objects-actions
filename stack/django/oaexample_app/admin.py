

####OBJECT-ACTIONS-ADMIN_IMPORTS-STARTS####
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Users
from .models import Songs
from .models import Playlists
from .models import Events
from .models import Friendships
from .models import Invites
from .models import SongRequests
from .models import EventCheckins
from .models import Likes
####OBJECT-ACTIONS-ADMIN_IMPORTS-ENDS####



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


admin.site.register(Users, UsersAdmin)

class SongsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Songs, SongsAdmin)

class PlaylistsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Playlists, PlaylistsAdmin)

class EventsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Events, EventsAdmin)

class FriendshipsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Friendships, FriendshipsAdmin)

class InvitesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Invites, InvitesAdmin)

class SongRequestsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(SongRequests, SongRequestsAdmin)

class EventCheckinsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(EventCheckins, EventCheckinsAdmin)

class LikesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Likes, LikesAdmin)
####OBJECT-ACTIONS-ADMIN_MODELS-ENDS####

























































































































































