####OBJECT-ACTIONS-VIEWSET-IMPORTS-STARTS####
import random
import re

from django.apps import apps
from django.core.management import call_command
from django.db import connection, transaction
from django.db.models import Count, Case, When, IntegerField
from django.db.models import Q
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
####OBJECT-ACTIONS-VIEWSET-IMPORTS-ENDS####
from django.utils.dateparse import parse_datetime
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import viewsets, permissions, filters, generics
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.views import APIView

from utils.helpers import fetch_dict_query
from .models import EventCheckins
from .models import Events
from .models import Friendships
from .models import InviteLinks
from .models import Invites
from .models import Likes
from .models import Playlists
from .models import SongRequests
from .models import Songs
from .models import Users
from .permissions import IsAuthorCohostOrInvited, IsEventHostOrCohost, IsAllowedToUpdateInvite, IsNotBlocked, IsAuthor, ORPermission
from .serializers import EventCheckinsSerializer
from .serializers import EventsSerializer
from .serializers import FriendshipsSerializer
from .serializers import InviteLinksSerializer
from .serializers import InvitesSerializer
from .serializers import LikesSerializer
from .serializers import PlaylistsSerializer
from .serializers import SongRequestsSerializer
from .serializers import SongsSerializer
from .serializers import UsersSerializer
from .services import send_sms


class LimitedLimitOffsetPagination(LimitOffsetPagination):
    max_limit = 100


class PaginatedViewSet(viewsets.ModelViewSet):
    pagination_class = LimitOffsetPagination

    def apply_pagination(self, queryset):
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, self.request, view=self)

        serializer_class = self.get_serializer_class_for_queryset(queryset)
        serializer = serializer_class(paginated_queryset, many=True)

        paginated_data = {
            'count': paginator.count,  # Total number of items
            'limit': paginator.limit,  # Number of items per page
            'offset': paginator.offset,  # Starting position of the current page
#            'next': paginator.get_next_link(),  # Link to the next page, if available
#            'previous': paginator.get_previous_link(),  # Link to the previous page, if available
            'results': serializer.data
        }

        return paginated_data

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data)

    def apply_status_filter(self, queryset):
        status_param = self.request.query_params.get('status')
        if status_param:
            status_list = status_param.split(',')
            if len(status_list) > 1:
                queryset = queryset.filter(status__in=status_list)
            else:
                queryset = queryset.filter(status=status_param)
        return queryset

    def get_serializer_class_for_queryset(self, queryset):
        # Use model's meta information to dynamically select the serializer
        model = queryset.model

        # Map models to serializers
        model_to_serializer = {
            Songs: SongsSerializer,
            Playlists: PlaylistsSerializer,
            Invites: InvitesSerializer,
            # Add more models and serializers as needed
        }

        # Return the corresponding serializer class
        return model_to_serializer.get(model, self.get_serializer_class())


####OBJECT-ACTIONS-VIEWSETS-STARTS####
class UsersViewSet(PaginatedViewSet):
    queryset = Users.objects.all().order_by('id')
    serializer_class = UsersSerializer
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', "username"]

    def get_object(self):
        # Override to get the user by ID
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)  # Apply custom permission
        return obj

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Only add is_friend on detail view
        if request.user != instance:
            friendship = Friendships.objects.filter(
                (Q(author=request.user) & Q(recipient=instance)) |
                (Q(author=instance) & Q(recipient=request.user))
            ).first()

            if friendship:
                data['friendship'] = {
                    'str': friendship.status,
                    'author_id': friendship.author.id,
                    'id': friendship.id,
                    '_type': 'Friendship'
                }
            else:
                data['friendship'] = None

        return JsonResponse(data)


class SongsViewSet(PaginatedViewSet):
    queryset = Songs.objects.all().order_by('id')
    serializer_class = SongsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'artist']


class PlaylistsViewSet(PaginatedViewSet):
    queryset = Playlists.objects.all().order_by('id')
    serializer_class = PlaylistsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        user = self.request.user
        return Playlists.objects.filter(
            Q(author=user) | Q(event__author=user) | Q(event__cohosts=user)
        ).distinct().order_by('id')


class EventsViewSet(PaginatedViewSet):
    serializer_class = EventsSerializer
    permission_classes = [IsAuthorCohostOrInvited]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        if request.user != instance.author:
            self.inject_invites_and_checkins(data, request.user.id)

        return JsonResponse(data)

    def get_queryset(self):
        user = self.request.user
        return Events.objects.filter(
            Q(cohosts=user) | Q(author=user) | Q(invites__recipient=user)
        ).distinct().order_by('starts')

    def inject_invites_and_checkins(self, row, uid):

        hasinvite = Invites.objects.filter(
            Q(recipient_id=uid) & Q(event_id=row['id'])
        ).first()
        if hasinvite:
            row['invite'] = InvitesSerializer(hasinvite).data

            starts = parse_datetime(row['starts'])
            ends = parse_datetime(row['ends'])

            current_datetime = timezone.now()  # Use timezone-aware datetime
            if starts <= current_datetime <= ends:
                checkin = EventCheckins.objects.filter(
                    Q(author_id=uid, event_id=row['id'], status='entered')
                ).first()

                if checkin:
                    row['checkin'] = {
                        'str': checkin.status,
                        'author_id': checkin.author.id,
                        'id': checkin.id,
                        '_type': 'EventCheckins'
                    }
                else:
                    row['checkin'] = None

        return row

    def inject_invites(self, data, uid):

        if data["count"] == 0:
            return data

        for row in data['results']:
            hasinvite = Invites.objects.filter(
                Q(recipient_id=uid) & Q(event_id=row['id'])
            ).first()
            if hasinvite:
                row['invite'] = InvitesSerializer(hasinvite).data

        return data

    @action(detail=False, methods=['get'], url_path='mine')
    def mine(self, request):
        user = request.user
        now = timezone.now()
        queryset = Events.objects.filter(
            Q(ends__gt=now) &
            (Q(cohosts=user) | Q(author=user))
        ).distinct().order_by('starts')
        data = self.apply_pagination(queryset)
        return JsonResponse(data, safe=False)

    @action(detail=False, methods=['get'], url_path='accepted')
    def accepted(self, request):
        user = request.user
        now = timezone.now()
        queryset = Events.objects.filter(
            ends__gt=now,
            invites__recipient=user,
            invites__status='accepted'
        ).distinct().order_by('starts')
        data = self.apply_pagination(queryset)
        if data["count"] > 0:
            for i, row in enumerate(data['results']):
                data['results'][i] = self.inject_invites_and_checkins(row, user.id)

        return JsonResponse(data)

    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request):
        user = request.user
        now = timezone.now()
        queryset = Events.objects.filter(
            Q(ends__gt=now) &
            Q(invites__recipient=user) &
            (Q(invites__status='referred') | Q(invites__status='requested'))
        ).distinct().order_by('starts')
        data = self.apply_pagination(queryset)
        if data["count"] > 0:
            for i, row in enumerate(data['results']):
                data['results'][i] = self.inject_invites_and_checkins(row, user.id)

        return JsonResponse(data)

    @action(detail=False, methods=['get'], url_path='invited')
    def invited(self, request):
        user = request.user
        now = timezone.now()
        queryset = Events.objects.filter(
            Q(ends__gt=now) &
            Q(invites__recipient=user) &
            Q(invites__status='invited')
        ).distinct().order_by('starts')
        data = self.apply_pagination(queryset)
        data = self.inject_invites(data, user.id)

        return JsonResponse(data)

    @action(detail=False, methods=['get'], url_path='(?P<event_id>[^/.]+)/songs-requests')
    def song_requests(self, request, event_id=None):
        queryset = SongRequests.objects.filter(event_id=event_id)
        queryset = self.apply_status_filter(queryset)

        data = self.apply_pagination(queryset)
        return JsonResponse(data, safe=False)

    """
    get Songs, from Playlists connected to this Event. Include both the the name and count of matches from different Playlists and authors of that Playlist
    """

    @action(detail=False, methods=['get'], url_path='(?P<event_id>[^/.]+)/song-recommendations')
    def song_recs(self, request, event_id=None):

        base_query = """
            SELECT S.name, S.artist, COUNT(S.name) as listener_count, MAX(S.id) as id, MAX(S.remote_image) as remote_image, MAX(S.cover) as cover
            FROM oaexample_app_songs S 
            LEFT JOIN oaexample_app_playlists P ON S.playlist_id = P.id
            WHERE P.event_id = %s
        """

        count_query = f"""
            SELECT COUNT(*) FROM (
                {base_query}
                GROUP BY S.name, S.artist
            ) AS subquery
        """

        limited_query = f"""
            {base_query}
            GROUP BY S.name, S.artist
            ORDER BY listener_count DESC, S.name ASC
            LIMIT %s OFFSET %s
        """

        limit = int(request.GET.get('limit', 10))
        offset = int(request.GET.get('offset', 0))

        params = [event_id, limit, offset]
        results = fetch_dict_query(limited_query, params)

        with connection.cursor() as cursor:
            cursor.execute(count_query, [event_id])
            total_count = cursor.fetchone()[0]

        paginator = {
            'count': total_count,
            "limit" : limit,
            "offset" : offset,
            # 'next': offset + limit if offset + limit < total_count else None,
            # 'previous': offset - limit if offset - limit >= 0 else None,
            'results': results
        }

        return JsonResponse(paginator, safe=False)


class EventsAliasView(generics.RetrieveAPIView):
    queryset = Events.objects.all()
    serializer_class = EventsSerializer
    lookup_field = 'url_alias'


class InvitesViewSet(PaginatedViewSet):
    serializer_class = InvitesSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['status']

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)  # Ensures DRF logic is respected

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAllowedToUpdateInvite]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated] # status gets overwritten by `serializer.validate_status`
        else:
            permission_classes = [permissions.IsAuthenticated]  # Allow any authenticated user to view
        return [permission() for permission in permission_classes]

    def get_object(self):
        obj = Invites.objects.get(pk=self.kwargs.get('pk'))
        self.check_object_permissions(self.request, obj)  # Triggers `has_object_permission`
        return obj

    def get_queryset(self, statuses=None):
        user = self.request.user
        now = timezone.now()  # Get the current date and time
        queryset = Invites.objects.filter(
            (Q(event__cohosts=user) | Q(event__author=user) | Q(recipient=user) | Q(author=user)) &
            Q(event__ends__gt=now)
        ).distinct().order_by('created_at')
        if statuses != 'all':
            queryset = queryset.filter(status__in=["referred", "requested", "invited"])
        queryset = self.apply_status_filter(queryset)

        return queryset

    @action(detail=False, methods=['get'], url_path='by-event/(?P<event_id>[^/.]+)')
    def by_event(self, request, event_id=None):
        user = self.request.user

        event = get_object_or_404(Events, pk=event_id)
        has_invite = Invites.objects.filter(Q(recipient=request.user) & Q(event=event_id)).first()
        can_managed = event.author == user or user in event.cohosts.all()

        if not can_managed:
            if not has_invite:
                return JsonResponse({"error": "You have not been invited yet"}, status=status.HTTP_403_FORBIDDEN)
            elif has_invite.status == "blocked":
                return JsonResponse({"error": "You can no longer view this guest list"}, status=status.HTTP_403_FORBIDDEN)

        queryset = Invites.objects.filter(event_id=event_id)

        if not can_managed:
            queryset = queryset.filter(status__in=["accepted"])
        else:
            if self.request.query_params.get('status'):
                queryset = self.apply_status_filter(queryset)
            else:
                queryset = queryset.filter(status__in=["accepted", "requested", "seen", "invited", "referred"])

        data = self.apply_pagination(queryset)

        if data["count"] == 0:
            return JsonResponse(data)

        isActive = True if event.starts <= timezone.now() <= event.ends else False

        for row in data['results']:
            other = row['author']['id'] if row['recipient']['id'] == user.id else row['recipient']['id']
            friendship = Friendships.objects.filter(
                (Q(author=request.user) & Q(recipient=other)) |
                (Q(author=other) & Q(recipient=request.user))
            ).first()

            if isActive:
                checkin = EventCheckins.objects.filter(
                    Q(author_id=row['recipient']['id'], event_id=event_id, status='entered')
                ).first()

                if checkin:
                    row['checkin'] = {
                        'str': checkin.status,
                        'author_id': checkin.author.id,
                        'id': checkin.id,
                        '_type': 'EventCheckins'
                    }

            if friendship:
                row['friendship'] = {
                    'str': friendship.status,
                    'author_id': friendship.author.id,
                    'recipient_id': friendship.recipient.id,
                    'id': friendship.id,
                    '_type': 'Friendship'
                }

        return JsonResponse(data, safe=False)

    @action(detail=False, methods=['get'], url_path='counts-by-event/(?P<event_id>[^/.]+)')
    def counts_by_event(self, request, event_id=None):
        counts = self.get_queryset('all').filter(event_id=event_id).aggregate(
            invited=Count(Case(When(status='invited', then=1), output_field=IntegerField())),
            seen=Count(Case(When(status='seen', then=1), output_field=IntegerField())),
            referred=Count(Case(When(status='referred', then=1), output_field=IntegerField())),
            requested=Count(Case(When(status='requested', then=1), output_field=IntegerField())),
            accepted=Count(Case(When(status='accepted', then=1), output_field=IntegerField())),
            declined=Count(Case(When(status='declined', then=1), output_field=IntegerField())),
            withdrawn=Count(Case(When(status='withdrawn', then=1), output_field=IntegerField())),
            blocked=Count(Case(When(status='blocked', then=1), output_field=IntegerField()))
        )
        return JsonResponse(counts)

    @action(detail=False, methods=['post'], url_path='batch-invite/(?P<event_id>[^/.]+)')
    def batch_invite(self, request, event_id=None):
        uids = request.data.get('uids')
        if not uids:
            return JsonResponse({"error": "Which users are your trying to invite?"}, status=status.HTTP_400_BAD_REQUEST)

        invites = []
        for uid in uids:
            invite, created = Invites.objects.get_or_create(
                recipient=uid,
                event=event_id,
                defaults={'status': 'invited', 'author': request.user}
            )
            if created:
                invites.append(invite)
            elif invite.status == 'withdrawn':
                serializer = InvitesSerializer(data=invite)
                serializer.set_value('status', 'pending')
                if serializer.is_valid():
                    serializer.save()

        if not invites:
            return JsonResponse({"message": "No new invites were created; all invites already exist."},
                                status=status.HTTP_200_OK)

        return JsonResponse({"message": f"{len(invites)} invites created."}, status=status.HTTP_201_CREATED)


class FriendshipsViewSet(PaginatedViewSet):
    serializer_class = FriendshipsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Friendships.objects.filter(
            Q(author=user) | Q(recipient=user)
        ).distinct().order_by('-modified_at')

        queryset = self.apply_status_filter(queryset)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = self.apply_pagination(queryset)

        event_id = self.request.query_params.get('event_id', None)
        if event_id and data["count"] > 0:
            for row in data['results']:
                other = row['author']['id'] if row['recipient']['id'] == self.request.user.id else row['recipient'][
                    'id']
                hasinvite = Invites.objects.filter(recipient=other, event_id=event_id).first()
                if hasinvite:
                    row['invite'] = InvitesSerializer(hasinvite).data

        return JsonResponse(data, safe=False)

    @action(detail=False, methods=['get'], url_path='by-event/(?P<event_id>[^/.]+)')
    def by_event(self, request, event_id):
        user = self.request.user
        queryset = self.get_queryset()
        data = self.apply_pagination(queryset)

        if data["count"] == 0:
            return JsonResponse(data)

        for row in data['results']:
            other = row['recipient']['id'] if row['author']['id'] == user.id else row['author']['id']
            hasinvite = Invites.objects.filter(
                Q(recipient_id=other) & Q(event_id=event_id)
            ).first()
            if hasinvite:
                row['invite'] = InvitesSerializer(hasinvite).data

        return JsonResponse(data)

    # Custom action to block a user
    @action(detail=False, methods=['post'], url_path='block-user')
    def block_user(self, request):
        target_user_id = request.data.get('recipient')

        if not target_user_id:
            return JsonResponse({"detail": "Target user ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = get_user_model().objects.get(id=target_user_id)
        except get_user_model().DoesNotExist:
            return JsonResponse({"detail": "Target user not found."}, status=status.HTTP_404_NOT_FOUND)

        current_user = request.user

        # Check if the friendship already exists between the two users
        try:
            # Attempt to retrieve the existing friendship
            friendship = Friendships.objects.get(
                Q(author=current_user, recipient=target_user) | Q(author=target_user, recipient=current_user)
            )
            # If the friendship exists, update the status to "blocked"
            friendship.status = Friendships.StatusChoices.blocked
            friendship.save()

        except Friendships.DoesNotExist:
            # Create a new friendship with status "blocked"
            friendship = Friendships.objects.create(
                author=current_user,
                recipient=target_user,
                status=Friendships.StatusChoices.blocked
            )

        return JsonResponse({
            "message": f"Friendship status with {target_user.username} set to 'blocked'.",
            "friendship_status": friendship.status
        }, status=status.HTTP_200_OK)


class SongRequestsViewSet(PaginatedViewSet):
    serializer_class = SongRequestsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['song__name', 'event__name', 'playlist__name']

    def get_permissions(self):
        if self.action == 'destroy':
            permission_classes = [ORPermission(IsAuthor, IsEventHostOrCohost)]
        else:
            permission_classes = [permissions.IsAuthenticated()]  # Allow any authenticated user to view
        return permission_classes

    def get_queryset(self):
        user = self.request.user
        now = timezone.now()  # Get the current date and time
        queryset = SongRequests.objects.filter(
            (Q(event__author=user) | Q(event__cohosts=user) | Q(author=user)) & # or your own song requests
            Q(event__ends__gt=now)
        ).annotate(
            likes_count=Count('songrequest_likes', filter=Q(songrequest_likes__type='songrequests'))
        ).order_by('-likes_count', 'created_at')

        queryset = self.apply_status_filter(queryset)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = self.apply_pagination(queryset)
        return JsonResponse(data, safe=False)

    @action(detail=False, methods=['get'], url_path='by-event/(?P<event_id>[^/.]+)')
    def by_event(self, request, event_id):
        queryset = SongRequests.objects.filter(event_id=event_id).annotate(
            likes_count=Count('songrequest_likes', filter=Q(songrequest_likes__type='songrequests'))
        ).order_by('-likes_count', 'created_at')
        queryset = self.apply_status_filter(queryset)
        data = self.apply_pagination(queryset)

        # check if this user liked!
        for row in data['results']:
            filter_kwargs = {
                'author_id': request.user.id,
                'type': 'songrequests',
                'events_id': event_id,
                f'songrequests_id': row['id']
            }

            existing_like = Likes.objects.filter(**filter_kwargs).first()
            if existing_like:
                row['iliked'] = True

        return JsonResponse(data, safe=False)


class EventCheckinsViewSet(PaginatedViewSet):
    serializer_class = EventCheckinsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['event__name']

    def get_queryset(self):
        user = self.request.user
        now = timezone.now()

        return EventCheckins.objects.filter(
            Q(event__author_id=user.id) |
            Q(event__cohosts=user) |
            Q(author=user) |
            Q(event__invites__recipient=user, event__invites__status="accepted")  # Filter for accepted invitations
        ).filter(
            Q(event__ends__gt=now)  # Filter for events that haven't ended
        ).distinct().order_by('id')

    @action(detail=False, methods=['get'], url_path='by-event/(?P<event_id>[^/.]+)')
    def by_event(self, request, event_id):
        queryset = EventCheckins.objects.filter(event_id=event_id).order_by('created_at')
        data = self.apply_pagination(queryset)
        return JsonResponse(data, safe=False)

    @action(detail=False, methods=['post'], url_path='toggle-checkin')
    def toggle_checkin(self, request):
        user = request.user
        event_id = request.data.get('event')
        coordinate = request.data.get('coordinate')
        checkin = request.data.get('status')

        if not event_id:
            return JsonResponse({'detail': 'Which Event are you checking in or out of.'},
                                status=status.HTTP_400_BAD_REQUEST)

        filter_kwargs = {
            'author': user.id,
            'event': event_id
        }

        exists = EventCheckins.objects.filter(**filter_kwargs).first()

        if exists:
            serializer = EventCheckinsSerializer(exists, data={"status": checkin}, partial=True)
        else:
            filter_kwargs['coordinate'] = coordinate
            filter_kwargs['status'] = checkin
            serializer = EventCheckinsSerializer(data=filter_kwargs)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse({'detail': checkin}, status=status.HTTP_200_OK)
        else:
            return JsonResponse({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LikesViewSet(PaginatedViewSet):
    serializer_class = LikesSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['songs__name', 'events__name', 'playlists__name']

    def get_queryset(self):
        user = self.request.user
        return Likes.objects.filter(
            Q(events__author=user) | Q(events__cohosts=user) | Q(playlists__author=user) | Q(author=user)
        ).distinct().order_by('id')

    @action(detail=False, methods=['get'], url_path='by-event/(?P<event_id>[^/.]+)')
    def by_event(self, request, event_id):
        queryset = Likes.objects.filter(events_id=event_id).order_by('created_at')
        data = self.apply_pagination(queryset)
        return JsonResponse(data, safe=False)

    @action(detail=False, methods=['post'], url_path='toggle-like')
    def create_or_delete_like(self, request):
        user = request.user
        item_type = request.data.get('type')
        item_id = request.data.get('item_id')
        event_id = request.data.get('event')

        if not item_type or not item_id or not event_id:
            return JsonResponse({'detail': 'Type, ID and Event are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Build the query to find the existing Like
        filter_kwargs = {
            'author_id': user.id,
            'type': item_type,
            'events_id': event_id,
            f'{item_type}_id': item_id
        }

        # Check if the like already exists
        existing_like = Likes.objects.filter(**filter_kwargs).first()

        if existing_like:
            existing_like.delete()
            return JsonResponse({'detail': 'Like removed'}, status=status.HTTP_200_OK)
        else:
            filter_kwargs['songs_id'] = request.data.get('song')  # WARN: get this from songrequest more reliably
            new_like = Likes.objects.create(**filter_kwargs)
            return JsonResponse({'detail': 'Liked'}, status=status.HTTP_201_CREATED)


####OBJECT-ACTIONS-VIEWSETS-ENDS####


####OBJECT-ACTIONS-CORE-STARTS####

def migrate(request):
    call_command('migrate')
    return JsonResponse({'status': 'migrations complete'})


def collectstatic(request):
    call_command('collectstatic', '--noinput')
    return JsonResponse({'status': 'static files collected'})


SEARCH_FIELDS_MAPPING = {
    "Users": [
        "first_name",
        "last_name"
    ],
    "Songs": [
        "name", "artist"
    ],
    "Playlists": [
        "name"
    ],
    "Events": [
        "name"
    ],
    "Friendships": [],
    "Invites": [
        "status",
        "event__name"
    ],
    "SongRequests": [
        "song__name",
        "event__name",
        "playlist__name"
    ],
    "EventCheckins": [
        "event__name"
    ],
    "Likes": [
        "songs__name",
        "events__name",
        "playlists__name"
    ]
}

SERIALZE_MODEL_MAP = {"Users": UsersSerializer, "Songs": SongsSerializer, "Playlists": PlaylistsSerializer,
                      "Events": EventsSerializer, "Friendships": FriendshipsSerializer, "Invites": InvitesSerializer,
                      "SongRequests": SongRequestsSerializer, "EventCheckins": EventCheckinsSerializer,
                      "Likes": LikesSerializer}


class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id, model_name):
        # Get the model class from the model name
        try:
            model = apps.get_model('oaexample_app', model_name)
        except LookupError:
            return JsonResponse({'error': 'Model not found'}, status=404)

        # Check if the model has an 'author' field
        if not hasattr(model, 'author'):
            return JsonResponse({'error': 'Model does not have an author field'}, status=400)

        if model_name == 'friendships':
            queryset = Friendships.objects.filter(
                Q(status="accepted") &
                (Q(author=user_id) | Q(recipient=user_id))
            ).distinct()
        elif model_name == 'playlists':
            queryset = Playlists.objects.filter(
                Q(author=user_id)
            ).distinct()
        elif model_name == 'events':
            now = timezone.now()
            queryset = Events.objects.filter(
                Q(ends__gt=now) &
                (Q(cohosts=user_id) | Q(author=user_id))
            ).distinct()
        elif model_name == 'songrequests':
            now = timezone.now()
            queryset = SongRequests.objects.filter(
                Q(status__in=["accepted", "requested"]) & Q(author=user_id) &
                Q(event__ends__gt=now)
            )
        else:
            return JsonResponse({'error': f'No stats provided on {model}'}, status=400)

        count = queryset.count()

        # Return the count as JSON
        return JsonResponse({'model': model_name, 'count': count})


@extend_schema(
    parameters=[
        OpenApiParameter(name='search', description='Search term', required=False, type=str),
    ],
    responses={200: 'Paginated list of objects owned by the user'},
)
class UserModelListView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = LimitedLimitOffsetPagination
    filter_backends = [filters.SearchFilter]

    def get(self, request, user_id, model_name):
        # Check if the model exists
        try:
            model_class = apps.get_model("oaexample_app", model_name)
        except LookupError:
            return JsonResponse({'error': 'Model not found.'}, status=404)

        if model_name == 'friendships':
            queryset = Friendships.objects.filter(
                Q(status="accepted") &
                (Q(author=user_id) | Q(recipient=user_id))
            ).distinct().order_by('created_at')
        elif model_name == 'playlists':
            queryset = Playlists.objects.filter(
                Q(author=user_id)
            ).distinct().order_by('created_at')
        elif model_name == 'events':
            now = timezone.now()
            queryset = Events.objects.filter(
                Q(ends__gt=now) &
                (Q(cohosts=user_id) | Q(author=user_id))
            ).distinct().order_by('created_at')
        elif model_name == 'songrequests':
            now = timezone.now()
            queryset = SongRequests.objects.filter(
                Q(status__in=["accepted", "requested"]) & Q(author=user_id) &
                Q(event__ends__gt=now)
            ).order_by('created_at')
        else:
            return JsonResponse({'error': f'No stats provided on {model_name}'}, status=400)

        serializer_class = self.get_serializer_class(model_class)

        if not serializer_class:
            return JsonResponse({'error': 'Serializer not found for this model.'}, status=404)

        # Apply pagination
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = serializer_class(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def get_serializer_class(self, model_class):
        # Dynamically determine the serializer class based on the model
        return SERIALZE_MODEL_MAP.get(model_class.__name__)

    def filter_queryset(self, queryset):
        search_filter = filters.SearchFilter()
        return search_filter.filter_queryset(self.request, queryset, self)


import urllib.request


class RenderFrontendIndex(APIView):
    def get(self, request, *args, **kwargs):
        file_path = os.getenv("FRONTEND_INDEX_HTML", "index.html")

        html_content = "Use API"
        if file_path.startswith('http://') or file_path.startswith('https://'):
            # Remote file
            with urllib.request.urlopen(file_path) as response:
                html_content = response.read().decode('utf-8')
        else:
            # Local file
            with open(file_path, 'r') as file:
                html_content = file.read()

        modified_html = html_content
        frontend_url = settings.FRONTEND_URL

        # Prepend the host to all relative URLs
        def prepend_host(match):
            url = match.group(1)
            if url.startswith('/') or not url.startswith(('http://', 'https://')):
                return f'{match.group(0)[:5]}{frontend_url}/{url.lstrip("/")}"'
            return match.group(0)

        # Prepend the host to all relative src and href URLs
        modified_html = re.sub(r'src="([^"]+)"', prepend_host, modified_html)
        modified_html = re.sub(r'href="([^"]+)"', prepend_host, modified_html)

        # react-scripts bundle instead of compiled version
        if ":3000" in frontend_url:
            modified_html = modified_html.replace('</head>',
                                                  f'<script defer="" src="{frontend_url}/static/js/bundle.js"></script></head>')

        return HttpResponse(modified_html, content_type='text/html')


from django.shortcuts import redirect


def redirect_to_frontend(request, provider=None):
    frontend_url = settings.FRONTEND_URL
    redirect_path = request.path
    query_params = request.GET.copy()
    if provider:
        query_params['provider'] = provider
    query_string = query_params.urlencode()
    response = redirect(f'{frontend_url}{redirect_path}?{query_string}')
    return response


####OBJECT-ACTIONS-CORE-ENDS####

from django.contrib.auth import get_user_model
from django.conf import settings
from allauth.account.models import EmailAddress
from allauth.account.utils import complete_signup, perform_login
from allauth.socialaccount.sessions import LoginSession
from rest_framework import status
from .serializers import VerifyPhoneSerializer, PhoneNumberSerializer

import os


class SendCodeView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow any user to access this view

    @extend_schema(
        request=PhoneNumberSerializer,
        responses={
            200: OpenApiResponse(description='SMS sent successfully', examples={
                'application/json': {"detail": "SMS sent successfully"}
            }),
            400: OpenApiResponse(description='Bad request', examples={
                'application/json': {"phone_number": ["This field is required."]}
            }),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = PhoneNumberSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone']
            code = str(random.randint(1000, 999999))
            if phone_number == '+14159999999':
                return JsonResponse({"detail": "Enter your Demo Account code"}, status=status.HTTP_200_OK)
            message = f"Your oaexample.com verification code is {code}"
            send_sms(phone_number, message)
            request.session['code'] = code
            return JsonResponse({"detail": "SMS sent successfully"}, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyCodeView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow any user to access this view

    @extend_schema(
        request=VerifyPhoneSerializer,
        responses={
            200: OpenApiResponse(description='SMS sent successfully', examples={
                'application/json': {"detail": "SMS sent successfully", "id": "user id"}
            }),
            400: OpenApiResponse(description='Bad request', examples={
                'application/json': {"phone_number": ["This field is required."]}
            }),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = VerifyPhoneSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone']
            code = str(serializer.validated_data['code'])
            if str(request.session.get('code')) == code or (phone_number == '+14159999999' and code == '542931'):

                redirect_url = f"/"

                try:
                    user = get_user_model().objects.get(phone=phone_number)
                    created = False
                except get_user_model().DoesNotExist:
                    user = get_user_model().objects.create(username=phone_number,
                                                           email=f'{phone_number}@sms-placeholder.com',
                                                           phone=phone_number)
                    created = True
                    redirect_url = f"/onboarding"

                if created:
                    user.phone = phone_number  # Save the phone field
                    user.set_unusable_password()  # Set password logic as needed
                    user.save()
                    email_address = EmailAddress.objects.create(user=user, email=user.email, verified=True,
                                                                primary=True)
                    response = complete_signup(request, user, False, redirect_url)
                else:
                    response = perform_login(
                        request,
                        user,
                        False,
                        redirect_url)

                LoginSession(request, "sms_login_session", settings.SESSION_COOKIE_NAME)
                response = JsonResponse({"detail": "Verification successful",
                                         "id": user.id,
                                         "redirect": redirect_url},
                                        status=status.HTTP_200_OK)
                response.url = redirect_url
                response.apiVersion = timezone.now()
                return response

            return JsonResponse({"error": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InviteLinkViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Default to IsAuthenticated for GET requests
    serializer_class = InviteLinksSerializer  # Define the serializer for the viewset
    queryset = InviteLinks.objects.all()

    def get_event(self, url_alias):
        """Retrieve the event associated with the url_alias."""
        return get_object_or_404(Events, url_alias=url_alias)

    def get_permissions(self):
        """
        Override get_permissions to set permissions dynamically.
        For GET requests, use IsAuthenticated. For POST, PUT, DELETE, etc., use IsAllowedToUpdateInvite.
        """
        if self.action == 'get':
            return [permissions.IsAuthenticated()]
        return [IsAuthorCohostOrInvited()]  # Custom permission for other actions

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve the invite link by url_alias, check its status, and handle invite creation
        or updates based on invite status.
        """
        url_alias = kwargs.get('pk')
        link = get_object_or_404(InviteLinks, url_alias=url_alias)

        # Check if the invite link is active
        if link.status != 'active':
            return JsonResponse({"detail": "This invite link has expired."},
                                status=status.HTTP_226_IM_USED)

        # Check if the invite link has been used too many times
        if link.allowed and link.allowed >= link.used - 1:
            return JsonResponse({"detail": "Invite link has been used too many times."},
                                status=status.HTTP_226_IM_USED)

        # Check if the user already has an invite for the event
        has_invite = Invites.objects.filter(Q(recipient=request.user) & Q(event=link.event)).first()

        has_friendship = Friendships.objects.filter(
            Q(status="accepted") &
            (
                    (Q(author=request.user) & (Q(recipient__in=link.event.cohosts.all()) | Q(recipient=link.event.author))) |
                    (Q(recipient=request.user) & (Q(author__in=link.event.cohosts.all()) | Q(author=link.event.author)))
            )
        ).first()

        data = {
            "event": EventsSerializer(link.event).data,
            "friendship": FriendshipsSerializer(has_friendship).data if has_friendship else None
        }

        if has_invite:

            data['event']["invite"] = InvitesSerializer(has_invite).data

            if has_invite.status == 'accepted':
                data['detail'] = "You're already going"
                return JsonResponse(data,
                                    status=status.HTTP_226_IM_USED)

            if has_invite.status in ['invited', 'requested', 'seen']:
                data['detail'] = f"Already {has_invite.status}"
                return JsonResponse(data,
                                    status=status.HTTP_208_ALREADY_REPORTED)

            if has_friendship:
                has_invite.status = 'accepted'
            else:
                has_invite.status = 'seen'

            data['event']["invite"]['status'] = has_invite.status

            has_invite.save()

            # Increment the usage count of the link
            link.used += 1
            link.save()

        else:
            # If no invite exists, create a new invite and update the link usage
            try:
                with transaction.atomic():
                    invite = Invites.objects.create(
                        author=link.author,
                        recipient=request.user,
                        event=link.event,
                        status= "accepted" if has_friendship else "seen",
                    )
                    data['event']["invite"] = InvitesSerializer(invite).data

                    link.used += 1
                    link.save()

                data['detail'] = "Invite created and InviteLink updated."
                return JsonResponse(data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        data['detail'] = "Invite already exists for this event."
        return JsonResponse(data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        Creates an InviteLink for the event corresponding to the `url_alias`.
        Accessible only to the event author or co-hosts.
        """
        eid = request.data.get('event')
        event = get_object_or_404(Events, pk=eid)

        url_alias = f"{event.url_alias}-{request.user.username}"

        # Ensure the user has permission to create an invite link (Author or Co-Host)
        self.check_object_permissions(request, event)

        invite_link = InviteLinks.objects.filter(url_alias=url_alias).first()
        if invite_link:
            data = InviteLinksSerializer(invite_link).data
            return JsonResponse(data, status=status.HTTP_200_OK)

        # Create the invite link for the event
        try:
            with transaction.atomic():
                invite_link = InviteLinks.objects.create(
                    event=event,
                    author=request.user,
                    status='active',
                    url_alias=url_alias,  # You might need logic to ensure this is unique
                    used=0  # Initial usage count
                )
                data = InviteLinksSerializer(invite_link).data
                return JsonResponse(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return JsonResponse({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """
        Updates the status of an Invite for the event corresponding to the `url_alias`.
        Accessible only to the event author or co-hosts.
        """
        url_alias = kwargs.get('url_alias')
        event = self.get_event(url_alias)

        # Ensure the user has permission to update the status (Author or Co-Host)
        self.check_object_permissions(request, event)

        # Retrieve the invite linked to the event and current user
        invite = Invites.objects.filter(author=request.user, event=event).first()

        if not invite:
            return JsonResponse({"detail": "Invite not found for this event."}, status=status.HTTP_404_NOT_FOUND)

        # Get the new status from the request data
        new_status = request.data.get("status")

        if not new_status or new_status not in dict(Invites.StatusChoices.choices):
            return JsonResponse({"detail": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

        # Update the invite's status
        invite.status = new_status
        invite.save()

        return JsonResponse({"detail": "Invite status updated successfully."}, status=status.HTTP_200_OK)
