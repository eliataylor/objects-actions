from rest_framework import permissions

class IsAuthor(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # User must be authenticated
        if not request.user.is_authenticated:
            return False

        user = request.user

        # Check if the user is the author or a cohost
        if obj.author == user:
            return True

        return False

class ORPermission(permissions.BasePermission):
    def __init__(self, *permissions):
        self.permissions = permissions

    def has_permission(self, request, view):
        return any(permission().has_permission(request, view) for permission in self.permissions)

    def has_object_permission(self, request, view, obj):
        return any(permission().has_object_permission(request, view, obj) for permission in self.permissions)
