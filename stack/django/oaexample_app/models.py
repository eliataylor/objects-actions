####OBJECT-ACTIONS-MODELS_IMPORTS-STARTS####
import os
import re

from allauth.account.models import EmailAddress
from allauth.account.signals import email_confirmed
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.dispatch import receiver
from django.utils import timezone
from django.utils.text import slugify
from django.utils.timezone import now

# from utils.models import BumpParentsModelMixin


####OBJECT-ACTIONS-MODELS_IMPORTS-ENDS####

def upload_file_path(instance, filename):
    # Get the file extension
    ext = filename.split('.')[-1]
    # Construct a unique filename with user ID and timestamp
    filename = f"{instance.id}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    # Return the complete path
    return os.path.join('uploads/%Y-%m', filename)


####OBJECT-ACTIONS-MODELS-STARTS####
def validate_phone_number(value):
    phone_regex = re.compile(r'^\+?1?\d{9,15}$')
    if not phone_regex.match(value):
        raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")


class Users(AbstractUser):
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['last_login']

    class GenderChoices(models.TextChoices):
        male = ("male", "Male")
        female = ("female", "Female")
        other = ("other", "Other")

    def get_lat_lng(self):
        return self.last_known_location['lat'], self.last_known_location['lng']

    phone = models.CharField(validators=[validate_phone_number], max_length=16, verbose_name='Phone', blank=True,
                             null=True)
    profile_picture = models.ImageField(upload_to=upload_file_path, blank=True, null=True,
                                        verbose_name='Profile Picture')
    birthday = models.DateField(blank=True, null=True, verbose_name='Birthday')
    bio = models.CharField(max_length=4000, blank=True, null=True, verbose_name='Bio')
    gender = models.CharField(max_length=20, choices=GenderChoices.choices, verbose_name='Gender', blank=True,
                              null=True)
    last_known_location = models.JSONField(verbose_name='Last Known Location', blank=True, null=True)
    link_ig = models.URLField(blank=True, null=True, verbose_name='Instagram')
    link_spotify = models.URLField(blank=True, null=True, verbose_name='Spotify')
    link_apple = models.URLField(blank=True, null=True, verbose_name='Apple Music')

    def __str__(self):
        return self.username

    def getName(self):
        if self.get_full_name().strip():
            return self.get_full_name()
        elif self.get_short_name().strip():
            return self.get_short_name()
        else:
            return self.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def add_email_address(self, request, new_email):
        # Add a new email address for the user, and send email confirmation.
        # Old email will remain the primary until the new one is confirmed.
        return EmailAddress.objects.add_email(request, request.user, new_email, confirm=True)

    @receiver(email_confirmed)
    def update_user_email(self, sender, request, email_address, **kwargs):
        # Once the email address is confirmed, make new email_address primary.
        # This also sets user.email to the new email address.
        # email_address is an instance of allauth.account.models.EmailAddress
        email_address.set_as_primary()
        # Get rid of old email addresses
        EmailAddress.objects.filter(user=email_address.user).exclude(primary=True).delete()


class SuperModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True, blank=True, related_name='+')

    class Meta:
        abstract = True
        ordering = ['modified_at']

    def save(self, *args, **kwargs):
        self.modified_at = now()
        super().save(*args, **kwargs)

    def __str__(self):
        if hasattr(self, "title"):
            return self.title
        elif hasattr(self, "name"):
            return self.name
        elif hasattr(self, "slug"):
            return self.slug

        return super().__str__()

    @classmethod
    def get_current_user(cls, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            return request.user
        return None


class Playlists(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Playlist"
        verbose_name_plural = "Playlists"

    class Social_sourceChoices(models.TextChoices):
        spotify = ("spotify", "Spotify")
        apple = ("apple", "Apple")

    id = models.AutoField(primary_key=True)
    social_source = models.CharField(max_length=20, choices=Social_sourceChoices.choices, verbose_name='Social Source',
                                     blank=True, null=True)
    social_id = models.CharField(max_length=64, verbose_name='Social ID')
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='+', null=True,
                               verbose_name='DJ')
    name = models.CharField(max_length=255, verbose_name='Name')
    image = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Image')
    remote_image = models.CharField(max_length=2555, blank=True, null=True, verbose_name='Remote Image')
    event = models.ForeignKey('Events', on_delete=models.CASCADE, related_name='playlist_events', null=True,
                              verbose_name='Event')
    playing_now = models.BooleanField(default=False, blank=True, null=True, verbose_name='Playing Now')


class Songs(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Song"
        verbose_name_plural = "Songs"

    id = models.AutoField(primary_key=True)
    spotify_id = models.CharField(max_length=255, blank=True, null=True, verbose_name='Spotify ID')
    apple_id = models.CharField(max_length=255, blank=True, null=True, verbose_name='Apple ID')
    name = models.CharField(max_length=255, verbose_name='Name')
    artist = models.CharField(max_length=255, blank=True, null=True, verbose_name='Artist')
    cover = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Cover')
    remote_image = models.CharField(max_length=2555, blank=True, null=True, verbose_name='Remote Image')
    playlist = models.ForeignKey('Playlists', on_delete=models.CASCADE, blank=True, null=True, verbose_name='Playlist')


class Events(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Event"
        verbose_name_plural = "Events"

    def save(self, *args, **kwargs):
        if 'name' in kwargs:
            self.name = kwargs.pop('name')

        base_slug = slugify(self.name)
        slug = base_slug
        count = 1

        while Events.objects.filter(url_alias=slug).exclude(id=self.id).exists():
            slug = f"{base_slug}-{count}"
            count += 1
        self.url_alias = slug

        super().save(*args, **kwargs)

    def is_happening_now(self) -> bool:
        current_datetime = timezone.now()  # Use timezone-aware datetime
        return self.starts <= current_datetime <= self.ends

    def get_lat_lng(self):
        return self.coordinates['lat'], self.coordinates['lng']

    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='+', null=True,
                               verbose_name='Host')
    cohosts = models.ManyToManyField(get_user_model(), related_name='cohosts_to_user_account', blank=True,
                                     verbose_name='Co-Hosts')
    url_alias = models.SlugField(unique=True, default="name", blank=True, null=True, verbose_name='URL Alias')
    name = models.CharField(max_length=255, verbose_name='Name')
    starts = models.DateTimeField(verbose_name='Starts')
    ends = models.DateTimeField(verbose_name='Ends')
    cover = models.ImageField(upload_to=upload_file_path, blank=False, null=False, verbose_name='Cover')
    description = models.TextField(verbose_name='Description')
    address = models.CharField(max_length=255)
    coordinates = models.JSONField(verbose_name='Coordinates', blank=True, null=True)


class Invites(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Invite"
        verbose_name_plural = "Invites"
        constraints = [
            models.UniqueConstraint(fields=['recipient', 'event'], name='unique_recipient_event'),
            models.CheckConstraint(
                check=~Q(recipient=models.F('author')),
                name='prevent_self_invite'
            ),
        ]

    def __str__(self):
        return f"{str(self.recipient)} - {str(self.event)} - {self.status}"

    def clean(self):
        # Check if there's a blocked invite for the same recipient
        blocked_invite_exists = Invites.objects.filter(
            recipient=self.recipient,
            event_id=self.event,
            status=Invites.StatusChoices.blocked
        ).exists()

        if blocked_invite_exists:
            raise ValidationError(
                f"Cannot create invite. The recipient '{self.recipient}' has been blocked this event.")

        super().clean()

    class StatusChoices(models.TextChoices):
        invited = ("invited", "Invited")  # user directly invited by host / cohost
        seen = ("seen", "Seen")  # the invite link was viewed a default invite was created for this user.
        referred = ("referred", "Referred")  # non host sends invite using app
        requested = ("requested", "Requested")  # "ill be there" was clicked from a seen or referred invite
        accepted = ("accepted", "Accepted")
        declined = ("declined", "Declined")
        withdrawn = ("withdrawn", "Withdrawn")
        blocked = ("blocked", "Blocked")

    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='+', null=True,
                               verbose_name='Sender')
    recipient = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='+', null=True,
                                  verbose_name='Recipient')
    event = models.ForeignKey('Events', on_delete=models.CASCADE, related_name='invites', null=True, blank=True,
                              verbose_name='Event')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="invited")


class InviteLinks(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Invite Link"
        verbose_name_plural = "Invite Links"
        constraints = [
            models.UniqueConstraint(fields=['author', 'event'], name='unique_author_link'),
        ]

    def __str__(self):
        return self.url_alias

    def save(self, *args, **kwargs):
        # Ensure that if the 'name' is not passed, it's pulled from the event's name field
        if not self.url_alias and self.event:
            base_slug = slugify(self.event.name)  # Use event's name to generate the alias
            slug = base_slug
            count = 1

            # Check for uniqueness and modify slug if necessary
            while InviteLinks.objects.filter(url_alias=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{count}"
                count += 1

            # Assign the generated URL alias
            self.url_alias = slug

        super().save(*args, **kwargs)

    url_alias = models.SlugField(unique=True, blank=True, null=True, verbose_name='URL Alias')

    class StatusChoices(models.TextChoices):
        active = ("active", "Active")
        expired = ("expired", "Expired")
        deleted = ("deleted", "Deleted")

    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='+', null=True, verbose_name='Sender')
    event = models.ForeignKey('Events', on_delete=models.CASCADE, related_name='InviteLinks', null=True, blank=True, verbose_name='Event')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="active")
    used = models.IntegerField(default=0, verbose_name='Used')
    allowed = models.IntegerField(verbose_name='Allowed', null=True, blank=True)


class Friendships(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Friendship"
        verbose_name_plural = "Friendships"
        constraints = [
            models.UniqueConstraint(fields=['recipient', 'author'], name='unique_friendship'),
            models.CheckConstraint(
                check=~Q(recipient=models.F('author')),
                name='prevent_self_friendship'
            ),
        ]

    def __str__(self):
        return f"{str(self.author)} requested {str(self.recipient)} status is {self.status}"

    def clean(self):
        # Check if there's a blocked invite for the same recipient
        blocked_friendship_exists = Friendships.objects.filter(
            recipient=self.recipient,
            author=self.author,
            status=Friendships.StatusChoices.blocked
        ).exists()

        if blocked_friendship_exists:
            raise ValidationError(
                f"Cannot create friendship. The recipient '{self.recipient}' has been blocked this user.")

        super().clean()

    class StatusChoices(models.TextChoices):
        pending = ("pending", "Pending")
        accepted = ("accepted", "Accepted")
        declined = ("declined", "Declined")
        withdrawn = ("withdrawn", "Withdrawn")
        blocked = ("blocked", "Blocked")

    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='friender', null=True,
                               verbose_name='Sender')
    recipient = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='friended', null=True,
                                  verbose_name='Recipient')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="pending")


class SongRequests(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Song Request"
        verbose_name_plural = "Song Requests"
        constraints = [
            models.UniqueConstraint(fields=['author', 'event', 'song'], name='unique_author_event_song')
        ]

    def __str__(self):
        return f"{str(self.author)} requested {str(self.song)} status is {self.status}"

    class StatusChoices(models.TextChoices):
        requested = ("requested", "Requested")
        accepted = ("accepted", "Accepted")
        declined = ("declined", "Declined")
        withdrawn = ("withdrawn", "Withdrawn")

    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='+', verbose_name='Requester')
    song = models.ForeignKey('Songs', on_delete=models.CASCADE, related_name='+', null=True, verbose_name='Song')
    song_desc = models.CharField(max_length=255)
    event = models.ForeignKey('Events', on_delete=models.CASCADE, related_name='+', verbose_name='Event')
    playlist = models.ForeignKey('Playlists', on_delete=models.CASCADE, related_name='+', null=True,
                                 verbose_name='Playlist')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="requested")


class EventCheckins(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Event Checkin"
        verbose_name_plural = "Event Checkins"
        constraints = [
            models.UniqueConstraint(fields=['author', 'event'], name='unique_checkin_author_event')
        ]

    def __str__(self):
        return f"{str(self.author)} {self.status} {str(self.event)} at {str(self.created_at)} near {self.coordinate}"

    def get_lat_lng(self):
        return self.coordinate['lat'], self.coordinate['lng']

    class StatusChoices(models.TextChoices):
        entered = ("entered", "Entered")
        left = ("left", "Left")

    event = models.ForeignKey('Events', on_delete=models.CASCADE, related_name='+', verbose_name='Event')
    coordinate = models.JSONField(verbose_name='Coordinate')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="entered")


class Likes(SuperModel):
    class Meta:
        abstract = False
        verbose_name = "Like"
        verbose_name_plural = "Likes"
        constraints = [
            models.UniqueConstraint(fields=['author', 'type', 'songrequests'], name='unique_like_author_songrequest')
        ]

    def __str__(self):
        return f"{str(self.author)} liked a {str(self.type)}. Event: {str(self.events)} Song: {str(self.songs)} Playlist: {str(self.playlists)}"

    class TypeChoices(models.TextChoices):
        song = ("songs", "Song")
        event = ("events", "Event")
        playlist = ("playlists", "Playlist")
        request = ("songrequests", "Request")
        checkin = ("eventcheckins", "Checkin")

    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='+', null=True,
                               verbose_name='Requester')
    type = models.CharField(max_length=20, choices=TypeChoices.choices, verbose_name='Type')
    eventcheckins = models.ForeignKey('EventCheckins', on_delete=models.CASCADE, related_name='+', null=True,
                                      blank=True, verbose_name='Event Checkin')
    songrequests = models.ForeignKey('SongRequests', on_delete=models.CASCADE, related_name='songrequest_likes',
                                     null=True, blank=True, verbose_name='Song Request')
    songs = models.ForeignKey('Songs', on_delete=models.CASCADE, related_name='+', null=True, blank=True,
                              verbose_name='Song')
    events = models.ForeignKey('Events', on_delete=models.CASCADE, related_name='+', null=True, blank=True,
                               verbose_name='Event')
    playlists = models.ForeignKey('Playlists', on_delete=models.CASCADE, related_name='+', null=True, blank=True,
                                  verbose_name='Playlist')


####OBJECT-ACTIONS-MODELS-ENDS####


# applemusic or anything not covered by AllAuth
class AppTokens(models.Model):
    class Meta:
        abstract = False
        verbose_name = "Social Token"
        verbose_name_plural = "Social Tokens"
        constraints = [
            models.UniqueConstraint(fields=['author', 'provider'], name='unique_user_provider')
        ]

    def __str__(self):
        return f"{str(self.author)} - {str(self.provider)}"

    class ProviderList(models.TextChoices):
        applemusic = ("applemusic", "applemusic")

    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, verbose_name='User')
    provider = models.CharField(max_length=25, choices=ProviderList.choices, verbose_name='Provider',
                                default="applemusic")
    token = models.TextField(
        verbose_name="token",
    )
    expires_at = models.DateTimeField(
        blank=True, null=True, verbose_name="expires at"
    )
