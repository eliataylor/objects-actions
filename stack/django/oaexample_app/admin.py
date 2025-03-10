####OBJECT-ACTIONS-ADMIN_IMPORTS-STARTS####
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Languages
from .models import Users
from .models import Courses
from .models import Questions
from .models import Responses
from .models import Certificates
####OBJECT-ACTIONS-ADMIN_IMPORTS-ENDS####
from .models import AppTokens
from django.utils.html import format_html

####OBJECT-ACTIONS-ADMIN_MODELS-STARTS####
class LanguagesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Languages, LanguagesAdmin)

class UsersAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Additional Info'), {'fields': ('prefered_language', 'certificates')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('prefered_language', 'certificates'),
        }),
    )                
    def display_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])


    list_display = ('id', 'username', 'email', 'get_full_name', 'display_groups')        


admin.site.register(Users, UsersAdmin)

class CoursesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Courses, CoursesAdmin)

class QuestionsAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Questions, QuestionsAdmin)

class ResponsesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Responses, ResponsesAdmin)

class CertificatesAdmin(admin.ModelAdmin):
	readonly_fields = ('id',)

admin.site.register(Certificates, CertificatesAdmin)
####OBJECT-ACTIONS-ADMIN_MODELS-ENDS####


class AppTokensAdmin(admin.ModelAdmin):
    readonly_fields = ()
admin.site.register(AppTokens, AppTokensAdmin)