from django.contrib.auth.decorators import permission_required
from allauth.account.models import EmailAddress
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission


class IsOwner(permissions.BasePermission):
    """
    Base permission to check if the current user owns the instance.
    Assumes the object has an 'author' attribute.
    """
    def has_object_permission(self, request, view, obj):
        return hasattr(obj, 'author') and obj.author == request.user


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def get_permissions(self):
        if self.action == 'list':
            # Any authenticated user can list, but will be filtered in get_queryset
            permission_classes = [IsAuthenticated]
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            # Must be owner OR admin to access specific object
            permission_classes = [IsAuthenticated & (IsOwner | IsAdminUser)]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


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
