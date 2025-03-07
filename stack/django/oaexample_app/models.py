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
from django.utils import timezone
import os
####OBJECT-ACTIONS-MODELS_IMPORTS-ENDS####

####OBJECT-ACTIONS-MODELS-STARTS####
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



	real_name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Real Name')
	bio = models.TextField(blank=True, null=True, verbose_name='Bio')
	picture = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Picture')
	cover_photo = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Cover Photo')
	churches = models.ForeignKey('Churches', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Churches')
	denominations = models.ForeignKey('Denomination', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Denominations')

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


class PostType(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Post Type"
		verbose_name_plural = "Post Types"

	name = models.CharField(max_length=255, verbose_name='Name')
	icon = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Icon')

class Denomination(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Denomination"
		verbose_name_plural = "Denominations"

	name = models.CharField(max_length=255, verbose_name='Name')
	icon = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Icon')

class Churches(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Church"
		verbose_name_plural = "Churches"

	name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Name')
	pastors = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Pastors')
	address = models.CharField(max_length=255)

class Post(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Post"
		verbose_name_plural = "Posts"

	title = models.CharField(max_length=255, verbose_name='Title')
	description = models.TextField(blank=True, null=True, verbose_name='Description')
	post_type = models.ForeignKey('PostType', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Post Type')
	published = models.DateTimeField(blank=True, null=True, verbose_name='Published')
	html_content = models.TextField(verbose_name='HTML Content')
	start_time = models.DateTimeField(blank=True, null=True, verbose_name='Start Time')
	end_time = models.DateTimeField(blank=True, null=True, verbose_name='End Time')
	image = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Image')
	video = models.FileField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Video')
	promo_link = models.URLField(blank=True, null=True, verbose_name='Promo Link')
	severity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Severity')

class Events(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Event"
		verbose_name_plural = "Events"
	
	def get_lat_lng(self): 
		return self.coordinates['lat'], self.coordinates['lng']
	title = models.CharField(max_length=255, verbose_name='Title')
	video_link = models.URLField(blank=True, null=True, verbose_name='Video Link')
	address = models.CharField(max_length=255)
	start_time = models.DateTimeField(verbose_name='Start Time')
	end_time = models.DateTimeField(verbose_name='End Time')
	coordinates = models.JSONField(verbose_name='Coordinates', blank=True, null=True)

class Services(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Service"
		verbose_name_plural = "Services"

	promo_link = models.URLField(verbose_name='Promo Link')

class RequestedResources(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Requested Resource"
		verbose_name_plural = "Requested Resources"

	title = models.CharField(max_length=255, verbose_name='Title')
	description = models.TextField(blank=True, null=True, verbose_name='Description')
	severity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Severity')

class Annoucements(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Annoucement"
		verbose_name_plural = "Annoucements"

	title = models.CharField(max_length=255, verbose_name='Title')
	description = models.TextField(blank=True, null=True, verbose_name='Description')

class Messages(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Message"
		verbose_name_plural = "Messages"

	sender = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Sender')
	recipeint = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Recipeint')
	text = models.CharField(max_length=255, verbose_name='Text')

class Groups(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Group"
		verbose_name_plural = "Groups"

	title = models.CharField(max_length=255, verbose_name='Title')
	description = models.TextField(blank=True, null=True, verbose_name='Description')
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Author')
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