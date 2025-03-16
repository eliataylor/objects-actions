# from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import permissions


"""
If own and others are both defined   
    If different       
        Check roles and ownership
    Else if same:       
        Only check roles

If only own is defined:    
    Check role and ownership.    
        Others falls back False

If only others is defined:     
    Check role and ownership      
        Own falls back to False
        
If neither is defined     
    Fallback on default permission 

——

If verb has list or detail:    
    Apply named permission at retrieve and list actions separately. 
    Named permission just tests role and ownership.

"""
###### USERS PERMISSIONS ######

class can_view_list_users(permissions):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class can_view_profile_users(permissions):
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.id != obj.author.id:
            # Others requires verified
            allowed = request.user.groups.filter(name='IsVerified').exists()
        else:
            allowed = True
        return allowed

class can_add_users(permissions):
    def has_permission(self, request, view):
        allowOwn = request.user is None or not request.user.is_authenticated
        return allowOwn

class can_edit_users(permissions):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.id == obj.author.id:
            return True
        else:
            return False

class can_delete_users(permissions):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.id == obj.author.id:
            return True
        else:
            return False

class can_block_users(permissions):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.id == obj.author.id:
            return False # you cannot block yourself
        else:
            return True

###### CITIES PERMISSIONS ######

# authenticated and anonymous are checked
class can_view_cities(permissions):
    def has_permission(self, request, view):
        return True

# verified is checked
class can_add_cities(permissions):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        allowOwn = request.user.groups.filter(name='IsVerified').exists()
        allowOther = request.user.groups.filter(name='IsAdmin').exists()

        # If author doesn't match current user and user isn't admin, permission denied
        if 'author' in request.data and int(request.data.get('author')) != request.user.id and not allowOther:
            return False

        return allowOwn or allowOther


# admin is required to edit someone else's city
class can_edit_cities(permissions):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.id != obj.author.id:
            # Others requires admin
            allowed = request.user.groups.filter(name='IsAdmin').exists()
        else:
            # Own requires verified (mostly likely implicit)
            allowed = request.user.groups.filter(name='IsVerified').exists()
        return allowed

# verified is checked
class can_delete_cities(permissions):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.id != obj.author.id:
            # Others requires admin
            allowed = request.user.groups.filter(name='IsAdmin').exists()
        else:
            # Own requires verified (mostly likely implicit)
            allowed = request.user.groups.filter(name='IsVerified').exists()
        return allowed

class can_comment_cities(permissions):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    # TODO: what does `obj` represent? the Cities or Comments model?
    def has_object_permission(self, request, view, obj):
        return request.user.groups.filter(name='IsVerified').exists()


class can_sponsor_cities(permissions):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
