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
from django.utils import timezone
import os
####OBJECT-ACTIONS-MODELS_IMPORTS-ENDS####

####OBJECT-ACTIONS-MODELS-STARTS####
def validate_phone_number(value):
	phone_regex = re.compile(r'^\+?1?\d{9,15}$')
	if not phone_regex.match(value):
		raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")

def upload_file_path(instance, filename):
	ext = filename.split('.')[-1]  # e.g. "jpg"
	# add datetime suffix to avoid collisions
	new_filename = f"{os.path.basename(filename)}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{ext}"
	# WARN: watch for overwrites when using DataBuilder or any batch upload

	# Use strftime to create a "year-month" folder dynamically
	date_folder = timezone.now().strftime('%Y-%m')

	# Construct the final upload path: "uploads/<yyyy-mm>/<filename>"
	return os.path.join('uploads', date_folder, new_filename)

class Users(AbstractUser, BumpParentsModelMixin):
	class Meta:
		verbose_name = "User"
		verbose_name_plural = "Users"
		ordering = ['last_login']

	phone = models.CharField(validators=[validate_phone_number], max_length=16, verbose_name='Phone', blank=True, null=True)
	website = models.URLField(blank=True, null=True, verbose_name='Website')
	bio = models.TextField(blank=True, null=True, verbose_name='Bio')
	picture = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Picture')
	cover_photo = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Cover Photo')
	resources = models.ManyToManyField('Resources', related_name='resources_to_resources', blank=True, verbose_name='Resources')

	def __str__(self):
		if self.get_full_name().strip():
			return self.get_full_name()
		elif self.get_short_name().strip():
			return self.get_short_name()
		elif self.username.strip():
			return self.username
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


class Officials(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Official"
		verbose_name_plural = "Officials"

	title = models.CharField(max_length=255, verbose_name='Job Title')
	office_phone = models.CharField(validators=[validate_phone_number], max_length=16, verbose_name='Office Phone', blank=True, null=True)
	office_email = models.EmailField(blank=True, null=True, verbose_name='Office Email')
	social_links = models.URLField(blank=True, null=True, verbose_name='Social Media links')
	party_affiliation = models.ForeignKey('Parties', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Party')
	city = models.ManyToManyField('Cities', related_name='city_to_cities', verbose_name='City')

class Cities(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "City"
		verbose_name_plural = "Cities"

	name = models.CharField(max_length=255, verbose_name='Name')
	description = models.TextField(blank=True, null=True, verbose_name='Description')
	postal_address = models.CharField(max_length=255)
	picture = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Picture')
	cover_photo = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Cover Photo')
	sponsors = models.ManyToManyField(get_user_model(), related_name='sponsors_to_user_profile', blank=True, verbose_name='Sponsors')
	website = models.URLField(blank=True, null=True, verbose_name='Website')
	population = models.IntegerField(blank=True, null=True, verbose_name='Population')
	altitude = models.IntegerField(blank=True, null=True, verbose_name='Altitude')
	county = models.CharField(max_length=255, blank=True, null=True, verbose_name='County')
	state_id = models.ForeignKey('States', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='State')
	officials = models.ManyToManyField(get_user_model(), related_name='officials_to_user_profile', blank=True, verbose_name='Officials')
	land_area = models.IntegerField(blank=True, null=True, verbose_name='Land Area')
	water_area = models.IntegerField(blank=True, null=True, verbose_name='Water Area')
	total_area = models.IntegerField(blank=True, null=True, verbose_name='Total Area')
	density = models.IntegerField(blank=True, null=True, verbose_name='Density')
	timezone = models.CharField(max_length=255, blank=True, null=True, verbose_name='Timezone')

class Rallies(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Rally"
		verbose_name_plural = "Rallies"

	title = models.CharField(max_length=255, verbose_name='Title')
	description = models.TextField(verbose_name='Description')
	media = models.FileField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Media')
	topics = models.ManyToManyField('Topics', related_name='topics_to_topics', verbose_name='Topics')
	comments = models.TextField(blank=True, null=True, verbose_name='Comments')

class Publications(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Publication"
		verbose_name_plural = "Publications"

	title = models.CharField(max_length=255, verbose_name='Title')
	description = models.TextField(verbose_name='Description')
	relationships = models.ForeignKey('Officials', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Relationships')
	media = models.FileField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Media')
	comments = models.TextField(blank=True, null=True, verbose_name='Comments')

class ActionPlans(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Action Plan"
		verbose_name_plural = "Action Plans"

	title = models.CharField(max_length=255, blank=True, null=True, verbose_name='Title')
	recommendation = models.TextField(blank=True, null=True, verbose_name='Recommendation')
	exe_summary = models.TextField(blank=True, null=True, verbose_name='Executive Summary')
	analysis = models.TextField(blank=True, null=True, verbose_name='Analysis and Policy Alternatives / Proposal')
	background = models.TextField(blank=True, null=True, verbose_name='Background / Legislative History / Problem Statement')
	coauthors = models.ManyToManyField(get_user_model(), related_name='coauthors_to_user_account', blank=True, verbose_name='CoAuthors')
	pro_argument = models.TextField(blank=True, null=True, verbose_name='Pro Argument')
	con_argument = models.TextField(blank=True, null=True, verbose_name='Con Argument')
	prerequisites = models.TextField(verbose_name='Prerequisites')
	timeline = models.TextField(blank=True, null=True, verbose_name='Timeline')
	rally = models.ForeignKey('Rallies', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Rally')

class Meetings(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Meeting"
		verbose_name_plural = "Meetings"

	title = models.CharField(max_length=255, blank=True, null=True, verbose_name='Title')
	rally = models.ForeignKey('Rallies', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Rally')
	meeting_type = models.ForeignKey('MeetingTypes', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Meeting Type')
	speakers = models.ManyToManyField(get_user_model(), related_name='speakers_to_user_account', verbose_name='Speakers')
	moderators = models.ManyToManyField(get_user_model(), related_name='moderators_to_user_account', verbose_name='Moderators')
	sponsors = models.ManyToManyField(get_user_model(), related_name='sponsors_to_user_account', blank=True, verbose_name='Sponsors')
	address = models.CharField(max_length=255)
	rooms = models.ForeignKey('Rooms', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Rooms')
	start = models.DateTimeField(verbose_name='Start')
	end = models.DateTimeField(verbose_name='End')
	agenda_json = models.JSONField(blank=True, null=True, verbose_name='Agenda JSON')
	duration = models.IntegerField(blank=True, null=True, verbose_name='Duration')
	privacy = models.IntegerField(blank=True, null=True, verbose_name='Privacy')

class Resources(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Resource"
		verbose_name_plural = "Resources"

	title = models.CharField(max_length=255, verbose_name='Title')
	description_html = models.TextField(verbose_name='Description HTML')
	image = models.ImageField(upload_to=upload_file_path, verbose_name='Image')
	postal_address = models.CharField(max_length=255, blank=True, null=True, verbose_name='Postal Address')
	price_ccoin = models.IntegerField(verbose_name='Price (citizencoin)')
	resource_type = models.ManyToManyField('ResourceTypes', related_name='resource_type_to_resource_types', verbose_name='Resource Type')

class Pages(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Page"
		verbose_name_plural = "Pages"

	title = models.CharField(max_length=255, verbose_name='Title')
	description_html = models.TextField(verbose_name='Description HTML')

class Invites(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Invite"
		verbose_name_plural = "Invites"

	class StatusChoices(models.TextChoices):
		invited = ("invited", "Invited")
		rsvpd = ("rsvpd", " rsvpd")
		attending = ("attending", " attending")
		attended = ("attended", " attended")
	meeting = models.ForeignKey('Meetings', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Meeting')
	user = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='User')
	invited_by = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Invited By')
	status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status')

class Subscriptions(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Subscription"
		verbose_name_plural = "Subscriptions"

	class StatusChoices(models.TextChoices):
		approved = ("approved", "Approved")
		denied = ("denied", " denied")
		active = ("active", " active")
		seen = ("seen", " seen")
	subscriber = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Subscriber')
	rally = models.ForeignKey('Rallies', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Rally')
	meeting = models.ForeignKey('Meetings', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Meeting')
	status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status')

class Rooms(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Room"
		verbose_name_plural = "Rooms"

	class PrivacyChoices(models.TextChoices):
		public = ("public", "Public")
		inviteonly = ("inviteonly", " invite-only")
		requests = ("requests", " requests")

	class StatusChoices(models.TextChoices):
		live = ("live", "Live")
		scheduled = ("scheduled", " scheduled")
		ended = ("ended", " ended")
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Owner')
	start = models.DateTimeField(verbose_name='Start')
	end = models.DateTimeField(verbose_name='End')
	rally = models.ForeignKey('Rallies', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Rally')
	meeting = models.ForeignKey('Meetings', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Meeting')
	privacy = models.CharField(max_length=20, choices=PrivacyChoices.choices, verbose_name='Privacy', blank=True, null=True)
	status = models.CharField(max_length=20, choices=StatusChoices.choices, verbose_name='Status', blank=True, null=True)
	chat_thread = models.CharField(max_length=255, blank=True, null=True, verbose_name='Chat Thread')
	recording = models.FileField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Recording')

class Attendees(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Attendee"
		verbose_name_plural = "Attendees"

	class RoleChoices(models.TextChoices):
		viewer = ("viewer", "Viewer")
		presenter = ("presenter", " presenter")
		admin = ("admin", " admin")
		chat_moderator = ("chat_moderator", " chat moderator")
	room_id = models.ForeignKey('Rooms', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Room ID')
	display_name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Display Name')
	display_bg = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Display Bg')
	role = models.CharField(max_length=20, choices=RoleChoices.choices, verbose_name='Role')
	stream = models.CharField(max_length=255, blank=True, null=True, verbose_name='Stream')
	is_muted = models.BooleanField(blank=True, null=True, verbose_name='Is Muted')
	sharing_video = models.BooleanField(blank=True, null=True, verbose_name='Sharing Video')
	sharing_audio = models.BooleanField(blank=True, null=True, verbose_name='Sharing Audio')
	sharing_screen = models.BooleanField(blank=True, null=True, verbose_name='Sharing Screen')
	hand_raised = models.BooleanField(blank=True, null=True, verbose_name='Hand Raised')
	is_typing = models.BooleanField(blank=True, null=True, verbose_name='Is Typing')

class Topics(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Topic"
		verbose_name_plural = "Topics"

	name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Name')
	icon = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Icon')
	photo = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Photo')

class ResourceTypes(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Resource Type"
		verbose_name_plural = "Resource Types"

	name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Name')

class MeetingTypes(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Meeting Type"
		verbose_name_plural = "Meeting Types"

	name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Name')

class States(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "State"
		verbose_name_plural = "States"

	name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Name')
	website = models.URLField(blank=True, null=True, verbose_name='Website')
	icon = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Icon')

class Parties(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Party"
		verbose_name_plural = "Parties"

	name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Name')
	logo = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Logo')
	website = models.URLField(blank=True, null=True, verbose_name='Website')

class Stakeholders(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Stakeholder"
		verbose_name_plural = "Stakeholders"

	name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Name')
	image = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Image')
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












































































































































