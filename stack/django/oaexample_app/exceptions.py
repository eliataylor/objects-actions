from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed, PermissionDenied
from rest_framework.views import exception_handler


def oa_exception_handler(exc, context):
    """
    Custom exception handler that provides detailed error messages for authentication and permission errors.
    Handles:
    - PermissionDenied: When a user lacks the required roles for an action
    - NotAuthenticated: When authentication credentials aren't provided
    - AuthenticationFailed: When provided credentials are invalid

    Uses permission class metadata to construct user-friendly error messages tailored to the
    user's authentication status and roles.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # Handle authentication and permission exceptions
    if isinstance(exc, PermissionDenied) or isinstance(exc, NotAuthenticated) or isinstance(exc, AuthenticationFailed):
        view = context.get('view')
        request = context.get('request')
        obj = None

        # Try to get the object if applicable (for object permissions)
        if hasattr(view, 'get_object'):
            try:
                # Only attempt if we're in a detail view with an ID in kwargs
                if hasattr(view, 'kwargs') and view.kwargs.get('pk'):
                    obj = view.get_object()
            except Exception:
                pass

        # Determine if this is for own or others' content
        is_own = False
        if obj:
            if hasattr(obj, 'author') and request.user.is_authenticated:
                is_own = obj.author.id == request.user.id
            elif hasattr(obj, 'id') and hasattr(request.user, 'id') and obj.__class__.__name__ == 'User':
                is_own = obj.id == request.user.id

        # Get current model name
        model_name = None
        if view and hasattr(view, 'get_serializer'):
            try:
                model_name = view.get_serializer().Meta.model.__name__
            except (AttributeError, Exception):
                model_name = view.__class__.__name__.replace('ViewSet', '')

        # Build error details similar to access.ts canDo() structure
        error_detail = {
            "permission_context": {
                "context": [model_name] if model_name else [],
                "verb": getattr(view, 'action', 'view'),
                "ownership": "own" if is_own else "others",
            }
        }

        # Add user's roles (groups)
        user_groups = []
        if request.user.is_authenticated:
            user_groups = ["authenticated"]
            user_groups.extend([g.name.replace('Is', '').lower() for g in request.user.groups.all()])
        else:
            user_groups = ["anonymous"]

        error_detail["permission_context"]["user_roles"] = user_groups

        # Extract required roles from permission classes
        required_roles = {
            "own": [],
            "others": []
        }

        # Set a default message based on exception type
        if isinstance(exc, NotAuthenticated) or isinstance(exc, AuthenticationFailed):
            custom_message = "Authentication credentials were not provided or are invalid."
        else:
            custom_message = str(exc) or "You don't have permission to perform this action."

        if hasattr(view, 'get_permissions'):
            permission_classes = view.get_permissions()

            for permission in permission_classes:
                # Extract required roles from permission class attributes
                if hasattr(permission, 'required_roles_own'):
                    required_roles["own"] = permission.required_roles_own
                elif hasattr(permission.__class__, 'required_roles_own'):
                    required_roles["own"] = permission.__class__.required_roles_own

                if hasattr(permission, 'required_roles_others'):
                    required_roles["others"] = permission.required_roles_others
                elif hasattr(permission.__class__, 'required_roles_others'):
                    required_roles["others"] = permission.__class__.required_roles_others

                # Check for help text (only for PermissionDenied)
                if isinstance(exc, PermissionDenied):
                    if hasattr(permission, 'help_text'):
                        custom_message = permission.help_text
                    elif hasattr(permission.__class__, 'help_text'):
                        custom_message = permission.__class__.help_text

            error_detail["permission_context"]["required_roles"] = required_roles

            # Construct a user-friendly message based on exception type
            if isinstance(exc, NotAuthenticated) or isinstance(exc, AuthenticationFailed) or (
                    isinstance(exc, PermissionDenied) and not request.user.is_authenticated):
                # Message for unauthenticated users
                ownership_type = "own" if is_own else "others"
                needed_roles = required_roles.get(ownership_type, [])

                if needed_roles and 'anonymous' not in needed_roles:
                    roles_str = ", ".join([f"'{role}'" for role in needed_roles if role != 'authenticated'])
                    if roles_str:
                        verb = error_detail["permission_context"]["verb"]
                        context_str = error_detail["permission_context"]["context"][0] if \
                            error_detail["permission_context"]["context"] else "this content"
                        ownership_word = "your own" if is_own else "someone else's"

                        custom_message = f"You must be signed in with {roles_str} permissions to {verb} {ownership_word} {context_str}."
                    else:
                        custom_message = f"You must be signed in to perform this action."
            elif isinstance(exc, PermissionDenied) and request.user.is_authenticated:
                # Message for authenticated users who lack required permissions
                ownership_type = "own" if is_own else "others"
                needed_roles = required_roles.get(ownership_type, [])
                missing_roles = [role for role in needed_roles if role not in user_groups and role != 'authenticated']

                if missing_roles:
                    roles_str = ", ".join([f"'{role}'" for role in missing_roles])
                    verb = error_detail["permission_context"]["verb"]
                    context_str = error_detail["permission_context"]["context"][0] if \
                        error_detail["permission_context"]["context"] else "this content"
                    ownership_word = "your own" if is_own else "someone else's"

                    custom_message = f"You need {roles_str} permissions to {verb} {ownership_word} {context_str}."

        # Override the response with our custom message
        error_detail["message"] = custom_message
        response.data = error_detail

        # Use appropriate status code based on exception type
        if isinstance(exc, NotAuthenticated) or isinstance(exc, AuthenticationFailed):
            response.status_code = 401  # Unauthorized
        else:
            response.status_code = 403  # Forbidden

    return response
