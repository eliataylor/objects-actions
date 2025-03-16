from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed, PermissionDenied
from rest_framework.views import exception_handler


def oa_exception_handler(exc, context):
    """
    Simplified exception handler that provides focused error messages for auth and permission errors.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if not response:
        return None

    # Handle authentication and permission exceptions
    if isinstance(exc, (PermissionDenied, NotAuthenticated, AuthenticationFailed)):
        view = context.get('view')
        request = context.get('request')

        # Set appropriate status code
        if isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
            status_code = 401  # Unauthorized
        else:
            status_code = 403  # Forbidden

        # Get basic information about the request
        action = getattr(view, 'action', 'access')
        model_name = None

        try:
            if view and hasattr(view, 'get_serializer'):
                model_name = view.get_serializer().Meta.model.__name__
        except (AttributeError, Exception):
            model_name = view.__class__.__name__.replace('ViewSet', '')

        # Determine ownership context
        is_own = False
        if hasattr(view, 'get_object') and hasattr(view, 'kwargs') and view.kwargs.get('pk'):
            try:
                obj = view.get_object()
                if request.user.is_authenticated:
                    if hasattr(obj, 'author'):
                        is_own = obj.author.id == request.user.id
                    elif hasattr(obj, 'id') and obj.__class__.__name__ in ['User', 'Users']:
                        is_own = obj.id == request.user.id
            except Exception:
                pass

        # Get required roles from permission classes
        required_roles = {"own": [], "others": []}
        ownership_type = "own" if is_own else "others"
        alt_ownership_type = "others" if is_own else "own"

        if hasattr(view, 'get_permissions'):
            for permission in view.get_permissions():
                # Check for direct attributes first
                if hasattr(permission, f'required_roles_{ownership_type}'):
                    required_roles[ownership_type] = getattr(permission, f'required_roles_{ownership_type}')
                elif hasattr(permission.__class__, f'required_roles_{ownership_type}'):
                    required_roles[ownership_type] = getattr(permission.__class__, f'required_roles_{ownership_type}')
                # If no roles found for primary ownership type, check alternative
                if not required_roles[ownership_type]:
                    if hasattr(permission, f'required_roles_{alt_ownership_type}'):
                        required_roles[ownership_type] = getattr(permission, f'required_roles_{alt_ownership_type}')
                    elif hasattr(permission.__class__, f'required_roles_{alt_ownership_type}'):
                        required_roles[ownership_type] = getattr(permission.__class__,
                                                                 f'required_roles_{alt_ownership_type}')

        # Create a user-friendly message
        default_message = str(exc) or "Permission denied."
        custom_message = default_message

        needed_roles = required_roles.get(ownership_type, [])
        if needed_roles:
            # User is not authenticated
            if isinstance(exc, (NotAuthenticated, AuthenticationFailed)) or not request.user.is_authenticated:
                if 'anonymous' not in needed_roles:
                    roles_str = ", ".join([f"'{role}'" for role in needed_roles if role != 'authenticated'])
                    if roles_str:
                        ownership_word = "your own" if is_own else "other's"
                        custom_message = f"You must be signed in with {roles_str} permissions to {action} {ownership_word} {model_name}."
                    else:
                        custom_message = "You must be signed in to perform this action."

            # User is authenticated but lacks roles
            elif request.user.is_authenticated:
                user_groups = ["authenticated"]
                user_groups.extend([g.name.replace('Is', '').lower() for g in request.user.groups.all()])

                missing_roles = [role for role in needed_roles if role not in user_groups]
                if missing_roles:
                    roles_str = ", ".join([f"'{role}'" for role in missing_roles])
                    ownership_word = "your own" if is_own else "other's"
                    custom_message = f"You need {roles_str} permissions to {action} {ownership_word} {model_name}."

        # Return simplified response
        response.data = {
            "message": custom_message,
            "status": status_code
        }
        response.status_code = status_code

    return response
