from django.db.models import Q
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from .models import Invites, Events, Friendships
from django.db.models import Q


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


class IsAuthorCohostOrInvited(permissions.BasePermission):
    """
    Custom permission to only allow access to event authors, cohosts, or users
    who have an accepted or pending invite to the event.
    """

    def has_object_permission(self, request, view, obj):
        # User must be authenticated
        if not request.user.is_authenticated:
            return False

        user = request.user

        # Check if the user is the author or a cohost
        if obj.author == user or user in obj.cohosts.all():
            return True

        # Check if the user has an accepted or pending invite
        invite_exists = Invites.objects.filter(
            Q(event=obj) &
            Q(recipient=user) &
            Q(status__in=[Invites.StatusChoices.accepted, Invites.StatusChoices.invited, Invites.StatusChoices.seen, Invites.StatusChoices.referred, Invites.StatusChoices.requested])
        ).exists()

        return invite_exists


class IsEventHostOrCohost(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST' or request.method == 'DELETE':
            event_id = request.data.get('event')
            if event_id:
                event = Events.objects.get(id=event_id)
                return request.user == event.author or request.user in event.cohosts.all()
        return False



class IsAllowedToUpdateInvite(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow read-only actions
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        event = obj.event
        # status_is = obj.status
        status_want = request.data.get('status')

        # anyone can refer an invite
        if status_want == 'referred' or status_want == 'requested': # although requested always goes through InviteLink part of API
            return True

        canManage = request.user == event.author or request.user in event.cohosts.all()
        if canManage:
            return True

        # Allow updates if the user is the event host, co-host, invite author, or recipient
        if status_want == 'invited':
            return canManage

        if status_want == 'accepted':
            has_friendship = Friendships.objects.filter(
                Q(status="accepted") &
                (
                        (Q(author=request.user) & (
                                    Q(recipient__in=event.cohosts.all()) | Q(recipient=event.author))) |
                        (Q(recipient=request.user) & (
                                    Q(author__in=event.cohosts.all()) | Q(author=event.author)))
                )
            ).first()
            return has_friendship or canManage

        return canManage


class IsNotBlocked(permissions.BasePermission):
    """
    Custom permission to prevent a user from viewing another user's data
    if a Friendship exists where the status is 'blocked'.
    """

    def has_object_permission(self, request, view, obj):
        # Check if the current user is blocked by or has blocked the requested user (obj)
        current_user = request.user
        blocked_friendship_exists = Friendships.objects.filter(
            (Q(author=current_user, recipient=obj) | Q(author=obj, recipient=current_user)),
            status=Friendships.StatusChoices.blocked
        ).exists()

        # Deny access if a blocked friendship exists
        if blocked_friendship_exists:
            raise PermissionDenied(detail="You are blocked from accessing this user's data.")
        return True

class ORPermission(permissions.BasePermission):
    def __init__(self, *permissions):
        self.permissions = permissions

    def has_permission(self, request, view):
        return any(permission().has_permission(request, view) for permission in self.permissions)

    def has_object_permission(self, request, view, obj):
        return any(permission().has_object_permission(request, view, obj) for permission in self.permissions)
