####OBJECT-ACTIONS-ADMIN_IMPORTS-STARTS####
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import PostType
from .models import Denomination
from .models import Users
from .models import Churches
from .models import Post
from .models import Events
from .models import Services
from .models import RequestedResources
from .models import Annoucements
from .models import Messages
from .models import Groups
####OBJECT-ACTIONS-ADMIN_IMPORTS-ENDS####
from .models import AppTokens
from django.utils.html import format_html

####OBJECT-ACTIONS-ADMIN_MODELS-STARTS####
class PostTypeAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(PostType, PostTypeAdmin)

class DenominationAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Denomination, DenominationAdmin)

class UsersAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Additional Info'), {'fields': ('real_name', 'bio', 'picture', 'cover_photo', 'churches', 'denominations')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('real_name', 'bio', 'picture', 'cover_photo', 'churches', 'denominations'),
        }),
    )                
    def display_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])


    list_display = ('id', 'username', 'email', 'get_full_name', 'display_groups')        


admin.site.register(Users, UsersAdmin)

class ChurchesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Churches, ChurchesAdmin)

class PostAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Post, PostAdmin)

class EventsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Events, EventsAdmin)

class ServicesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Services, ServicesAdmin)

class RequestedResourcesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(RequestedResources, RequestedResourcesAdmin)

class AnnoucementsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Annoucements, AnnoucementsAdmin)

class MessagesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Messages, MessagesAdmin)

class GroupsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Groups, GroupsAdmin)
####OBJECT-ACTIONS-ADMIN_MODELS-ENDS####


class AppTokensAdmin(admin.ModelAdmin):
    readonly_fields = ()
admin.site.register(AppTokens, AppTokensAdmin)