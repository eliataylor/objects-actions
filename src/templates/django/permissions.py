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
