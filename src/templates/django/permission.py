from rest_framework.permissions import BasePermission

class Is__ROLE__User(BasePermission):
    """
    Custom permission to only allow users in the 'Admin' group to access the view.
    """
    def has_permission(self, request, view):
        # Check if the user belongs to the 'Admin' group
        return request.user.groups.filter(name='__ROLE__').exists()
