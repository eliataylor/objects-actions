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

####OBJECT-ACTIONS-PERMISSIONS-IMPORTS-STARTS####
from rest_framework.permissions import BasePermission
####OBJECT-ACTIONS-PERMISSIONS-IMPORTS-ENDS####

####OBJECT-ACTIONS-PERMISSIONS-STARTS####
"""This file contains permission classes generated from the permissions matrix.
These classes are used by the DRF viewsets to control access to API endpoints.

Each permission class contains metadata used by the oa_exception_handler to create detailed error messages:
- required_roles_own: List of roles that can access their own content
- required_roles_others: List of roles that can access content owned by others
- context_info: Contains context (model) and verb information
- help_text: (Optional) Additional explanation about the permission

The oa_exception_handler constructs error messages based on this metadata,
adapting to the current user's authentication status and roles.
"""

class can_view_list_users(BasePermission):
    """Permission class for view_list operations on Users.
        Others' content: Allows authenticated, city sponsor
    """
    required_roles_own = []
    required_roles_others = ['authenticated', 'city sponsor']
    help_text = 'Can users view the list of other user\'s accounts'
    context_info = {'context': ['Users'], 'verb': 'view_list'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='city sponsor').exists() or request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        is_own = request.user.id == obj.id
        if not is_own:
            return request.user.is_authenticated or request.user.groups.filter(name='city sponsor').exists()
        else:
            return False  # Own not allowed


class can_view_profile_users(BasePermission):
    """Permission class for view_profile operations on Users.
        Own content: Allows authenticated
    Others' content: Allows verified
    """
    required_roles_own = ['authenticated']
    required_roles_others = ['verified']
    help_text = 'Can user view their own profile details'
    context_info = {'context': ['Users'], 'verb': 'view_profile'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        is_own = request.user.id == obj.id
        if is_own:
            return request.user.is_authenticated
        else:
            return request.user.groups.filter(name='verified').exists()


class can_add_users(BasePermission):
    """Permission class for add operations on Users.
        Own content: Allows anonymous
    """
    required_roles_own = ['anonymous']
    required_roles_others = []
    help_text = 'Can users register for their own accounts'
    context_info = {'context': ['Users'], 'verb': 'add'}
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        is_own = request.user.id == obj.id
        if is_own:
            return True
        else:
            return False


class can_sign_up_users(BasePermission):
    """Permission class for sign_up operations on Users.
        Own content: Allows anonymous
    """
    required_roles_own = ['anonymous']
    required_roles_others = []
    help_text = 'Can users update their own profile'
    context_info = {'context': ['Users'], 'verb': 'sign_up'}
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        is_own = request.user.id == obj.id
        if is_own:
            return True
        else:
            return False  # Others not allowed


class can_edit_user_users(BasePermission):
    """Permission class for edit_user operations on Users.
        Own content: Allows authenticated
    """
    required_roles_own = ['authenticated']
    required_roles_others = []
    help_text = 'Can users update other user\'s profile'
    context_info = {'context': ['Users'], 'verb': 'edit_user'}
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
    """Permission class for delete_user operations on Users.
        Own content: Allows authenticated
    """
    required_roles_own = ['authenticated']
    required_roles_others = []
    help_text = 'Can users delete their own account'
    context_info = {'context': ['Users'], 'verb': 'delete_user'}
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
    """Permission class for block_user operations on Users.
        Others' content: Allows verified
    """
    required_roles_own = []
    required_roles_others = ['verified']
    help_text = 'Can users delete other another user\'s account'
    context_info = {'context': ['Users'], 'verb': 'block_user'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = request.user.id == obj.id
        if not is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Own not allowed


class can_view_cities(BasePermission):
    """Permission class for view operations on Cities.
        Own content: Allows anonymous, authenticated
    Others' content: Allows anonymous, authenticated
    """
    required_roles_own = ['anonymous', 'authenticated']
    required_roles_others = ['anonymous', 'authenticated']
    context_info = {'context': ['Cities'], 'verb': 'view'}
    def has_permission(self, request, view):
        return True


class can_add_cities(BasePermission):
    """Permission class for add operations on Cities.
        Own content: Allows verified
    Others' content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = ['verified']
    context_info = {'context': ['Cities'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()


class can_edit_cities(BasePermission):
    """Permission class for edit operations on Cities.
        Own content: Allows verified
    Others' content: Allows admin
    """
    required_roles_own = ['verified']
    required_roles_others = ['admin']
    context_info = {'context': ['Cities'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='admin').exists()


class can_delete_cities(BasePermission):
    """Permission class for delete operations on Cities.
        Own content: Allows verified
    Others' content: Allows admin
    """
    required_roles_own = ['verified']
    required_roles_others = ['admin']
    context_info = {'context': ['Cities'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='admin').exists()


class can_add_comment_cities(BasePermission):
    """Permission class for add_comment operations on Cities.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Cities'], 'verb': 'add_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_edit_comment_cities(BasePermission):
    """Permission class for edit_comment operations on Cities.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Cities'], 'verb': 'edit_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_delete_comment_cities(BasePermission):
    """Permission class for delete_comment operations on Cities.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Cities'], 'verb': 'delete_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_sponsor_cities(BasePermission):
    """Permission class for sponsor operations on Cities.
        Own content: Allows authenticated
    Others' content: Allows authenticated
    """
    required_roles_own = ['authenticated']
    required_roles_others = ['authenticated']
    context_info = {'context': ['Cities'], 'verb': 'sponsor'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_authenticated


class can_view_rallies(BasePermission):
    """Permission class for view operations on Rallies.
        Own content: Allows anonymous, authenticated
    Others' content: Allows anonymous, authenticated
    """
    required_roles_own = ['anonymous', 'authenticated']
    required_roles_others = ['anonymous', 'authenticated']
    context_info = {'context': ['Rallies'], 'verb': 'view'}
    def has_permission(self, request, view):
        return True


class can_add_rallies(BasePermission):
    """Permission class for add operations on Rallies.
        Own content: Allows rally attendee, rally speaker, rally moderator
    """
    required_roles_own = ['rally attendee', 'rally speaker', 'rally moderator']
    required_roles_others = []
    context_info = {'context': ['Rallies'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='rally moderator').exists()
        else:
            return False  # Others not allowed


class can_edit_rallies(BasePermission):
    """Permission class for edit operations on Rallies.
        Own content: Allows verified
    Others' content: Allows admin, rally moderator
    """
    required_roles_own = ['verified']
    required_roles_others = ['admin', 'rally moderator']
    context_info = {'context': ['Rallies'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally moderator').exists()


class can_delete_rallies(BasePermission):
    """Permission class for delete operations on Rallies.
        Own content: Allows verified
    Others' content: Allows admin
    """
    required_roles_own = ['verified']
    required_roles_others = ['admin']
    context_info = {'context': ['Rallies'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='admin').exists()


class can_subscribe_rallies(BasePermission):
    """Permission class for subscribe operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies'], 'verb': 'subscribe'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_edit_subscribe_rallies(BasePermission):
    """Permission class for edit_subscribe operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Subscriptions'], 'verb': 'edit_subscribe'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_delete_subscription_rallies(BasePermission):
    """Permission class for delete_subscription operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Subscriptions'], 'verb': 'delete_subscription'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_add_comment_rallies(BasePermission):
    """Permission class for add_comment operations on Rallies.
        Own content: Allows rally attendee, rally moderator
    """
    required_roles_own = ['rally attendee', 'rally moderator']
    required_roles_others = []
    context_info = {'context': ['Rallies'], 'verb': 'add_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally moderator').exists() or request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='rally moderator').exists()
        else:
            return False  # Others not allowed


class can_edit_comment_rallies(BasePermission):
    """Permission class for edit_comment operations on Rallies.
        Own content: Allows rally attendee
    """
    required_roles_own = ['rally attendee']
    required_roles_others = []
    context_info = {'context': ['Rallies'], 'verb': 'edit_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='rally attendee').exists()
        else:
            return False  # Others not allowed


class can_delete_comment_rallies(BasePermission):
    """Permission class for delete_comment operations on Rallies.
        Own content: Allows rally attendee
    Others' content: Allows admin, rally moderator
    """
    required_roles_own = ['rally attendee']
    required_roles_others = ['admin', 'rally moderator']
    context_info = {'context': ['Rallies'], 'verb': 'delete_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally moderator').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='admin').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='rally attendee').exists()
        else:
            return request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally moderator').exists()


class can_view_officials(BasePermission):
    """Permission class for view operations on Officials.
        Own content: Allows anonymous, authenticated
    Others' content: Allows anonymous, authenticated
    """
    required_roles_own = ['anonymous', 'authenticated']
    required_roles_others = ['anonymous', 'authenticated']
    context_info = {'context': ['Officials'], 'verb': 'view'}
    def has_permission(self, request, view):
        return True


class can_add_officials(BasePermission):
    """Permission class for add operations on Officials.
        Own content: Allows admin, city sponsor
    Others' content: Allows admin, city sponsor
    """
    required_roles_own = ['admin', 'city sponsor']
    required_roles_others = ['admin', 'city sponsor']
    context_info = {'context': ['Officials'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='admin').exists()


class can_edit_officials(BasePermission):
    """Permission class for edit operations on Officials.
        Own content: Allows admin, city sponsor
    Others' content: Allows admin, city sponsor
    """
    required_roles_own = ['admin', 'city sponsor']
    required_roles_others = ['admin', 'city sponsor']
    context_info = {'context': ['Officials'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='admin').exists()


class can_delete_officials(BasePermission):
    """Permission class for delete operations on Officials.
        Own content: Allows admin, city sponsor
    Others' content: Allows admin, city sponsor
    """
    required_roles_own = ['admin', 'city sponsor']
    required_roles_others = ['admin', 'city sponsor']
    context_info = {'context': ['Officials'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='admin').exists()


class can_view_actionplans(BasePermission):
    """Permission class for view operations on ActionPlans.
        Own content: Allows anonymous, authenticated
    Others' content: Allows anonymous, authenticated
    """
    required_roles_own = ['anonymous', 'authenticated']
    required_roles_others = ['anonymous', 'authenticated']
    context_info = {'context': ['ActionPlans'], 'verb': 'view'}
    def has_permission(self, request, view):
        return True


class can_add_actionplans(BasePermission):
    """Permission class for add operations on ActionPlans.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['ActionPlans'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_edit_actionplans(BasePermission):
    """Permission class for edit operations on ActionPlans.
        Own content: Allows verified
    Others' content: Allows admin
    """
    required_roles_own = ['verified']
    required_roles_others = ['admin']
    context_info = {'context': ['ActionPlans'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='admin').exists()


class can_delete_actionplans(BasePermission):
    """Permission class for delete operations on ActionPlans.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['ActionPlans'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False


class can_add_comment_actionplans(BasePermission):
    """Permission class for add_comment operations on ActionPlans.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['ActionPlans'], 'verb': 'add_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_edit_comment_actionplans(BasePermission):
    """Permission class for edit_comment operations on ActionPlans.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['ActionPlans'], 'verb': 'edit_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_delete_comment_actionplans(BasePermission):
    """Permission class for delete_comment operations on ActionPlans.
        Own content: Allows verified
    Others' content: Allows admin
    """
    required_roles_own = ['verified']
    required_roles_others = ['admin']
    context_info = {'context': ['ActionPlans'], 'verb': 'delete_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='admin').exists()


class can_edit_rallies(BasePermission):
    """Permission class for edit operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False


class can_delete_rallies(BasePermission):
    """Permission class for delete operations on Rallies.
        Own content: Allows verified
    Others' content: Allows admin, rally moderator
    """
    required_roles_own = ['verified']
    required_roles_others = ['admin', 'rally moderator']
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally moderator').exists()


class can_add_comment_rallies(BasePermission):
    """Permission class for add_comment operations on Rallies.
        Own content: Allows rally attendee
    """
    required_roles_own = ['rally attendee']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'add_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='rally attendee').exists()
        else:
            return False  # Others not allowed


class can_edit_comment_rallies(BasePermission):
    """Permission class for edit_comment operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'edit_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_delete_comment_rallies(BasePermission):
    """Permission class for delete_comment operations on Rallies.
        Own content: Allows verified
    Others' content: Allows rally moderator
    """
    required_roles_own = ['verified']
    required_roles_others = ['rally moderator']
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'delete_comment'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='rally moderator').exists()


class can_sponsor_rallies(BasePermission):
    """Permission class for sponsor operations on Rallies.
        Own content: Allows verified
    Others' content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = ['verified']
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'sponsor'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()


class can_apply_to_speak_rallies(BasePermission):
    """Permission class for apply_to_speak operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'apply_to_speak'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_withdraw_application_rallies(BasePermission):
    """Permission class for withdraw_application operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'withdraw_application'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_approve_speaker_rallies(BasePermission):
    """Permission class for approve_speaker operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'approve_speaker'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_reject_speaker_rallies(BasePermission):
    """Permission class for reject_speaker operations on Rallies.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rallies', 'Meetings'], 'verb': 'reject_speaker'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_view_invites(BasePermission):
    """Permission class for view operations on Invites.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Invites'], 'verb': 'view'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_add_invites(BasePermission):
    """Permission class for add operations on Invites.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Invites'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_edit_invites(BasePermission):
    """Permission class for edit operations on Invites.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Invites'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_delete_invites(BasePermission):
    """Permission class for delete operations on Invites.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Invites'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_view_meetings(BasePermission):
    """Permission class for view operations on Meetings.
        Own content: Allows verified, admin, rally attendee
    Others' content: Allows admin, rally attendee
    """
    required_roles_own = ['verified', 'admin', 'rally attendee']
    required_roles_others = ['admin', 'rally attendee']
    context_info = {'context': ['Meetings'], 'verb': 'view'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='admin').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally attendee').exists()
        else:
            return request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally attendee').exists()


class can_add_meetings(BasePermission):
    """Permission class for add operations on Meetings.
        Own content: Allows verified, rally attendee
    """
    required_roles_own = ['verified', 'rally attendee']
    required_roles_others = []
    context_info = {'context': ['Meetings'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()
        else:
            return False  # Others not allowed


class can_edit_meetings(BasePermission):
    """Permission class for edit operations on Meetings.
        Own content: Allows verified, rally attendee
    """
    required_roles_own = ['verified', 'rally attendee']
    required_roles_others = []
    context_info = {'context': ['Meetings'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()
        else:
            return False  # Others not allowed


class can_delete_meetings(BasePermission):
    """Permission class for delete operations on Meetings.
        Own content: Allows verified, rally attendee
    """
    required_roles_own = ['verified', 'rally attendee']
    required_roles_others = []
    context_info = {'context': ['Meetings'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()
        else:
            return False  # Others not allowed


class can_view_rooms(BasePermission):
    """Permission class for view operations on Rooms.
        Own content: Allows verified
    Others' content: Allows admin, rally attendee, city sponsor, city official, rally speaker, rally moderator
    """
    required_roles_own = ['verified']
    required_roles_others = ['admin', 'rally attendee', 'city sponsor', 'city official', 'rally speaker', 'rally moderator']
    context_info = {'context': ['Rooms'], 'verb': 'view'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='rally moderator').exists()


class can_add_rooms(BasePermission):
    """Permission class for add operations on Rooms.
        Own content: Allows admin, rally attendee, city sponsor, city official, rally speaker, rally moderator
    """
    required_roles_own = ['admin', 'rally attendee', 'city sponsor', 'city official', 'rally speaker', 'rally moderator']
    required_roles_others = []
    context_info = {'context': ['Rooms'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='rally moderator').exists()
        else:
            return False  # Others not allowed


class can_edit_rooms(BasePermission):
    """Permission class for edit operations on Rooms.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rooms'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_delete_rooms(BasePermission):
    """Permission class for delete operations on Rooms.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Rooms'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_view_subscriptions(BasePermission):
    """Permission class for view operations on Subscriptions.
        Own content: Allows verified, admin, rally attendee, rally moderator
    Others' content: Allows admin, rally attendee, rally moderator
    """
    required_roles_own = ['verified', 'admin', 'rally attendee', 'rally moderator']
    required_roles_others = ['admin', 'rally attendee', 'rally moderator']
    context_info = {'context': ['Subscriptions'], 'verb': 'view'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='rally moderator').exists()
        else:
            return request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='rally moderator').exists()


class can_add_subscriptions(BasePermission):
    """Permission class for add operations on Subscriptions.
        Own content: Allows verified, rally attendee
    """
    required_roles_own = ['verified', 'rally attendee']
    required_roles_others = []
    context_info = {'context': ['Subscriptions'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()
        else:
            return False  # Others not allowed


class can_edit_subscriptions(BasePermission):
    """Permission class for edit operations on Subscriptions.
        Own content: Allows verified, rally attendee
    """
    required_roles_own = ['verified', 'rally attendee']
    required_roles_others = []
    context_info = {'context': ['Subscriptions'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()
        else:
            return False  # Others not allowed


class can_delete_subscriptions(BasePermission):
    """Permission class for delete operations on Subscriptions.
        Own content: Allows verified, rally attendee
    """
    required_roles_own = ['verified', 'rally attendee']
    required_roles_others = []
    context_info = {'context': ['Subscriptions'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists() or request.user.groups.filter(name='rally attendee').exists()
        else:
            return False  # Others not allowed


class can_view_list_resources(BasePermission):
    """Permission class for view_list operations on Resources.
        Own content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = []
    context_info = {'context': ['Resources'], 'verb': 'view_list'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='verified').exists()
        else:
            return False  # Others not allowed


class can_view_resources(BasePermission):
    """Permission class for view operations on Resources.
        Own content: Allows verified
    Others' content: Allows verified
    """
    required_roles_own = ['verified']
    required_roles_others = ['verified']
    context_info = {'context': ['Resources'], 'verb': 'view'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='verified').exists()


class can_add_resources(BasePermission):
    """Permission class for add operations on Resources.
        Own content: Allows paid user, rally attendee, city sponsor, city official, rally speaker, rally moderator
    """
    required_roles_own = ['paid user', 'rally attendee', 'city sponsor', 'city official', 'rally speaker', 'rally moderator']
    required_roles_others = []
    context_info = {'context': ['Resources'], 'verb': 'add'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='paid user').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='paid user').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='rally moderator').exists()
        else:
            return False  # Others not allowed


class can_edit_resources(BasePermission):
    """Permission class for edit operations on Resources.
        Own content: Allows paid user, rally attendee, city sponsor, city official, rally speaker, rally moderator
    """
    required_roles_own = ['paid user', 'rally attendee', 'city sponsor', 'city official', 'rally speaker', 'rally moderator']
    required_roles_others = []
    context_info = {'context': ['Resources'], 'verb': 'edit'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='paid user').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='paid user').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='rally moderator').exists()
        else:
            return False  # Others not allowed


class can_delete_resources(BasePermission):
    """Permission class for delete operations on Resources.
        Own content: Allows paid user, rally attendee, city sponsor, city official, rally speaker, rally moderator
    """
    required_roles_own = ['paid user', 'rally attendee', 'city sponsor', 'city official', 'rally speaker', 'rally moderator']
    required_roles_others = []
    context_info = {'context': ['Resources'], 'verb': 'delete'}
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='paid user').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='rally moderator').exists()

    def has_object_permission(self, request, view, obj):
        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id
        if is_own:
            return request.user.groups.filter(name='paid user').exists() or request.user.groups.filter(name='rally attendee').exists() or request.user.groups.filter(name='city sponsor').exists() or request.user.groups.filter(name='city official').exists() or request.user.groups.filter(name='rally speaker').exists() or request.user.groups.filter(name='rally moderator').exists()
        else:
            return False  # Others not allowed

####OBJECT-ACTIONS-PERMISSIONS-ENDS####
