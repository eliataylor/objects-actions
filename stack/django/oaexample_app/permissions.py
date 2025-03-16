# from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import permissions
from rest_framework.permissions import BasePermission

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

class can_view_list_users(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class can_view_profile_users(BasePermission):
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.id != obj.author.id:
            # Others requires verified
            allowed = request.user.groups.filter(name='IsVerified').exists()
        else:
            allowed = True
        return allowed

class can_add_users(BasePermission):
    def has_permission(self, request, view):
        allowOwn = request.user is None or not request.user.is_authenticated
        return allowOwn

class can_edit_users(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.id == obj.author.id:
            return True
        else:
            return False

class can_delete_users(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.id == obj.author.id:
            return True
        else:
            return False

class can_block_users(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.id == obj.author.id:
            return False # you cannot block yourself
        else:
            return True

###### CITIES PERMISSIONS ######

# authenticated and anonymous are checked
class can_view_cities(BasePermission):
    def has_permission(self, request, view):
        return True

# verified is checked
class can_add_cities(BasePermission):
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
class can_edit_cities(BasePermission):
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
class can_delete_cities(BasePermission):
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

class can_comment_cities(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    # TODO: what does `obj` represent? the Cities or Comments model?
    def has_object_permission(self, request, view, obj):
        return request.user.groups.filter(name='IsVerified').exists()


class can_sponsor_cities(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

####OBJECT-ACTIONS-PERMISSIONS-IMPORTS-STARTS####
from rest_framework import permissions
from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model
####OBJECT-ACTIONS-PERMISSIONS-IMPORTS-ENDS####

####OBJECT-ACTIONS-PERMISSIONS-STARTS####
class can_view_list_users(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.is_authenticated or request.user.groups.filter(name='IsCitySponsor').exists()

	def has_object_permission(self, request, view, obj):
		is_own = request.user.id == obj.id
		if not is_own:
			return request.user.is_authenticated or request.user.groups.filter(name='IsCitySponsor').exists()
		else:
			return False  # Own not allowed


class can_view_profile_users(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.is_authenticated or request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = request.user.id == obj.id
		if is_own:
			return request.user.is_authenticated
		else:
			return request.user.groups.filter(name='IsVerified').exists()


class can_add_users(BasePermission):
	def has_permission(self, request, view):
		return True

	def has_object_permission(self, request, view, obj):
		is_own = request.user.id == obj.id
		if is_own:
			return True
		else:
			return False


class can_sign_up_users(BasePermission):
	def has_permission(self, request, view):
		return True

	def has_object_permission(self, request, view, obj):
		is_own = request.user.id == obj.id
		if is_own:
			return True
		else:
			return False  # Others not allowed


class can_edit_user_users(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.is_authenticated

	def has_object_permission(self, request, view, obj):
		is_own = request.user.id == obj.id
		if is_own:
			return request.user.is_authenticated
		else:
			return False  # Others not allowed


class can_delete_user_users(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.is_authenticated

	def has_object_permission(self, request, view, obj):
		is_own = request.user.id == obj.id
		if is_own:
			return request.user.is_authenticated
		else:
			return False  # Others not allowed


class can_block_user_users(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = request.user.id == obj.id
		if not is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Own not allowed


class can_view_cities(BasePermission):
	def has_permission(self, request, view):
		return True


class can_add_cities(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()


class can_edit_cities(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists()


class can_delete_cities(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists()


class can_add_comment_cities(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_edit_comment_cities(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_delete_comment_cities(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_sponsor_cities(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.is_authenticated


class can_view_rallies(BasePermission):
	def has_permission(self, request, view):
		return True


class can_add_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsRallyModerator').exists()
		else:
			return False  # Others not allowed


class can_edit_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyModerator').exists()


class can_delete_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists()


class can_subscribe_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_edit_subscribe_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_delete_subscription_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_add_comment_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsRallyModerator').exists()
		else:
			return False  # Others not allowed


class can_edit_comment_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return False  # Others not allowed


class can_delete_comment_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyModerator').exists()


class can_view_officials(BasePermission):
	def has_permission(self, request, view):
		return True


class can_add_officials(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsAdmin').exists()


class can_edit_officials(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsAdmin').exists()


class can_delete_officials(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsAdmin').exists()


class can_view_actionplans(BasePermission):
	def has_permission(self, request, view):
		return True


class can_add_actionplans(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_edit_actionplans(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists()


class can_delete_actionplans(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False


class can_add_comment_actionplans(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_edit_comment_actionplans(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_delete_comment_actionplans(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists()


class can_edit_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False


class can_delete_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyModerator').exists()


class can_add_comment_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return False  # Others not allowed


class can_edit_comment_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_delete_comment_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsRallyModerator').exists()


class can_sponsor_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()


class can_apply_to_speak_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_withdraw_application_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_approve_speaker_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_reject_speaker_rallies(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_view_invites(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_add_invites(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_edit_invites(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_delete_invites(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_view_meetings(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()


class can_add_meetings(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return False  # Others not allowed


class can_edit_meetings(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return False  # Others not allowed


class can_delete_meetings(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return False  # Others not allowed


class can_view_rooms(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsRallyModerator').exists()


class can_add_rooms(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsRallyModerator').exists()
		else:
			return False  # Others not allowed


class can_edit_rooms(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_delete_rooms(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_view_subscriptions(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsRallyModerator').exists()
		else:
			return request.user.groups.filter(name='IsAdmin').exists() or request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsRallyModerator').exists()


class can_add_subscriptions(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return False  # Others not allowed


class can_edit_subscriptions(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return False  # Others not allowed


class can_delete_subscriptions(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()
		else:
			return False  # Others not allowed


class can_view_list_resources(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsVerified').exists()
		else:
			return False  # Others not allowed


class can_view_resources(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsVerified').exists()


class can_add_resources(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsPaidUser').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsPaidUser').exists() or request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsRallyModerator').exists()
		else:
			return False  # Others not allowed


class can_edit_resources(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsPaidUser').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsPaidUser').exists() or request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsRallyModerator').exists()
		else:
			return False  # Others not allowed


class can_delete_resources(BasePermission):
	def has_permission(self, request, view):
		if not request.user or not request.user.is_authenticated:
			return False
		return request.user.groups.filter(name='IsPaidUser').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsRallyModerator').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallyAttendee').exists()

	def has_object_permission(self, request, view, obj):
		is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
		if is_own:
			return request.user.groups.filter(name='IsPaidUser').exists() or request.user.groups.filter(name='IsRallyAttendee').exists() or request.user.groups.filter(name='IsCitySponsor').exists() or request.user.groups.filter(name='IsCityOfficial').exists() or request.user.groups.filter(name='IsRallySpeaker').exists() or request.user.groups.filter(name='IsRallyModerator').exists()
		else:
			return False  # Others not allowed

####OBJECT-ACTIONS-PERMISSIONS-ENDS####