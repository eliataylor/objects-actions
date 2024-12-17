

####OBJECT-ACTIONS-PERMISSIONS-IMPORTS-STARTS####
from rest_framework import permissions
from rest_framework.permissions import BasePermission
####OBJECT-ACTIONS-PERMISSIONS-IMPORTS-ENDS####



####OBJECT-ACTIONS-PERMISSIONS-STARTS####
from django.contrib.auth.decorators import permission_required

@permission_required('app.change_post', raise_exception=True)
def edit_post(request, post_id):
    # View logic here
    pass
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















