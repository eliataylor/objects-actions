

####OBJECT-ACTIONS-PERMISSIONS-IMPORTS-STARTS####
from rest_framework import permissions
from rest_framework.permissions import BasePermission
####OBJECT-ACTIONS-PERMISSIONS-IMPORTS-ENDS####



####OBJECT-ACTIONS-PERMISSIONS-STARTS####
from django.contrib.auth.decorators import permission_required
from allauth.account.models import EmailAddress
from django.core.exceptions import ObjectDoesNotExist


@permission_required('.__VERB_____OBJECT__', raise_exception=True)
def edit_post(request, post_id):
    # View logic here
    pass


class IsOwner(permissions.BasePermission):
    """
    Base permission to check if the current user owns the instance.
    Assumes the object has an 'author' attribute.
    """
    def has_object_permission(self, request, view, obj):
        return hasattr(obj, 'author') and obj.author == request.user


def user_has_role(user, roles):
    """
    Check if a user has any role in the provided list,
    and optionally check if their email is verified.
    """
    if 'anonymous' in roles and not user.is_authenticated:
        return True
    if 'authenticated' in roles and user.is_authenticated:
        return True
    if 'verified' in roles:
        # Check if the user has a verified email
        try:
            return EmailAddress.objects.filter(user=user, verified=True).exists()
        except ObjectDoesNotExist:
            return False
    return user.groups.filter(name__in=roles).exists()
class IsAnonymousUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='anonymous').exists()
class IsAuthenticatedUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='authenticated').exists()
class IsVerifiedUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='verified').exists()
class IsPaiduserUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='paid user').exists()
class IsAdminUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='admin').exists()
class IsRallyattendeeUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='rally attendee').exists()
class IsCitysponsorUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='city sponsor').exists()
class IsCityofficialUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='city official').exists()
class IsRallyspeakerUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='rally speaker').exists()
class IsRallymoderatorUser(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='rally moderator').exists()
####OBJECT-ACTIONS-PERMISSIONS-ENDS####











































































