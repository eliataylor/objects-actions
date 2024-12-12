####OBJECT-ACTIONS-MODELS_IMPORTS-STARTS####
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from utils.models import BumpParentsModelMixin
from allauth.account.models import EmailAddress
from django.dispatch import receiver
from allauth.account.signals import email_confirmed
from django.utils.timezone import now
from django.core.exceptions import ValidationError
import re
from django.utils.text import slugify
from rest_framework import generics
####OBJECT-ACTIONS-MODELS_IMPORTS-ENDS####


####OBJECT-ACTIONS-MODELS-STARTS####
def validate_phone_number(value):
	phone_regex = re.compile(r'^\+?1?\d{9,15}$')
	if not phone_regex.match(value):
		raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")

class Users(AbstractUser, BumpParentsModelMixin):
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

	phone = models.CharField(validators=[validate_phone_number], max_length=16, verbose_name='Phone', blank=True, null=True)
	profile_picture = models.ImageField(upload_to='uploads/%Y-%m', blank=True, null=True, verbose_name='Profile Picture')
	birthday = models.DateField(blank=True, null=True, verbose_name='Birthday')
	gender = models.CharField(max_length=20, choices=GenderChoices.choices, verbose_name='Gender', blank=True, null=True)
	last_known_location = models.JSONField(verbose_name='Last Known Location', blank=True, null=True)
	link_ig = models.URLField(blank=True, null=True, verbose_name='Instagram')
	link_spotify = models.URLField(blank=True, null=True, verbose_name='Spotify')
	link_apple = models.URLField(blank=True, null=True, verbose_name='Apple Music')

	def __str__(self):
		if self.get_full_name().strip():
			return self.get_full_name()
		elif self.get_short_name().strip():
			return self.get_short_name()
		else:
			return str(self.id) # never expose the email

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)

	def add_email_address(self, request, new_email):
		# Add a new email address for the user, and send email confirmation.
		# Old email will remain the primary until the new one is confirmed.
		return EmailAddress.objects.add_email(request, request.user, new_email, confirm=True)


	@receiver(email_confirmed)
	def update_user_email(sender, request, email_address, **kwargs):
		# Once the email address is confirmed, make new email_address primary.
		# This also sets user.email to the new email address.
		# email_address is an instance of allauth.account.models.EmailAddress
		email_address.set_as_primary()
		# Get rid of old email addresses
		EmailAddress.objects.filter(user=email_address.user).exclude(primary=True).delete()

class SuperModel(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	modified_at = models.DateTimeField(auto_now=True)
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
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
	cover = models.ImageField(upload_to='uploads/%Y-%m', blank=True, null=True, verbose_name='Cover')

class Playlists(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Playlist"
		verbose_name_plural = "Playlists"
	
	class Social_sourceChoices(models.TextChoices):
		spotify = ("spotify", "Spotify")
		apple = ("apple", "Apple")
	id = models.AutoField(primary_key=True)
	social_source = models.CharField(max_length=20, choices=Social_sourceChoices.choices, verbose_name='Social Source', blank=True, null=True)
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='DJ')
	name = models.CharField(max_length=255, verbose_name='Name')
	image = models.ImageField(upload_to='uploads/%Y-%m', blank=True, null=True, verbose_name='Image')
	event = models.ForeignKey('Events', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Event')
	playing_now = models.BooleanField(default=False, blank=True, null=True, verbose_name='Playing Now')

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

	
	def get_lat_lng(self): 
		return self.coordinates['lat'], self.coordinates['lng']
	id = models.AutoField(primary_key=True)
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Host')
	cohosts = models.ManyToManyField(get_user_model(), related_name='cohosts_to_user_account', blank=True, verbose_name='Co-Hosts')
	url_alias = models.SlugField(unique=True, default="name", blank=True, null=True, verbose_name='URL Alias')
	name = models.CharField(max_length=255, verbose_name='Name')
	starts = models.DateTimeField(verbose_name='Starts')
	ends = models.DateTimeField(verbose_name='Ends')
	cover = models.ImageField(upload_to='uploads/%Y-%m', blank=True, null=True, verbose_name='Cover')
	description = models.TextField(verbose_name='Description')
	address = models.CharField(max_length=255)
	coordinates = models.JSONField(verbose_name='Coordinates', blank=True, null=True)

class Friendships(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Friendship"
		verbose_name_plural = "Friendships"
	
	class StatusChoices(models.TextChoices):
		pending = ("pending", "Pending")
		accepted = ("accepted", "Accepted")
		declined = ("declined", "Declined")
		withdrawn = ("withdrawn", "Withdrawn")
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Sender')
	recipient = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Recipient')
	status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="pending")

class Invites(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Invite"
		verbose_name_plural = "Invites"
	
	class StatusChoices(models.TextChoices):
		invited = ("invited", "Invited")
		accepted = ("accepted", "Accepted")
		declined = ("declined", "Declined")
		withdrawn = ("withdrawn", "Withdrawn")
	sender = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Sender')
	recipient = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Recipient')
	event = models.ForeignKey('Events', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Event')
	status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="invited")

class SongRequests(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Song Request"
		verbose_name_plural = "Song Requests"
	
	class StatusChoices(models.TextChoices):
		requested = ("requested", "Requested")
		accepted = ("accepted", "Accepted")
		declined = ("declined", "Declined")
		withdrawn = ("withdrawn", "Withdrawn")
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Requester')
	song = models.ForeignKey('Songs', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Song')
	event = models.ForeignKey('Events', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Event')
	playlist = models.ForeignKey('Playlists', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Playlist')
	status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="requested")

class EventCheckins(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Event Checkin"
		verbose_name_plural = "Event Checkins"
	
	def get_lat_lng(self): 
		return self.coordinate['lat'], self.coordinate['lng']
	
	class StatusChoices(models.TextChoices):
		entered = ("entered", "Entered")
		left = ("left", "Left")
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='User')
	event = models.ForeignKey('Events', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Event')
	coordinate = models.JSONField(verbose_name='Coordinate')
	status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', default="entered")

class Likes(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Like"
		verbose_name_plural = "Likes"
	
	class TypeChoices(models.TextChoices):
		song = ("song", "Song")
		event = ("event", "Event")
		playlist = ("playlist", "Playlist")
		request = ("request", "Request")
		checkin = ("checkin", "Checkin")
		friendship = ("friendship", "Friendship")
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Requester')
	type = models.CharField(max_length=20, choices=TypeChoices.choices, verbose_name='Type')
	song = models.ForeignKey('Songs', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Song')
	event = models.ForeignKey('Events', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Event')
	playlist = models.ForeignKey('Playlists', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Playlist')
####OBJECT-ACTIONS-MODELS-ENDS####












































































