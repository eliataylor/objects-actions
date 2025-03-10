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



	prefered_language = models.ForeignKey('Languages', on_delete=models.SET_NULL, related_name='+', null=True, blank=True, verbose_name='Prefered Language')
	certificates = models.ManyToManyField('Certificates', related_name='certificates_to_certificates', blank=True, verbose_name='Certificates')

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


class Languages(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Language"
		verbose_name_plural = "Languages"
	
	class CountriesChoices(models.TextChoices):
		jamaica = ("jamaica", "Jamaica")
		south_africa = ("south_africa", " South Africa")
		tanzania = ("tanzania", " Tanzania")
		belize = ("belize", " Belize")
		guatemala = ("guatemala", " Guatemala")
		honduras = ("honduras", " Honduras")
		nicaragua = ("nicaragua", " Nicaragua")
		mexico = ("mexico", " Mexico")
		spain = ("spain", " Spain")
	name = models.CharField(max_length=255, verbose_name='Name')
	icon = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Icon')
	countries = models.CharField(max_length=12, choices=CountriesChoices.choices, verbose_name='Countries', blank=True, null=True)

class Courses(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Course"
		verbose_name_plural = "Courses"

	title = models.CharField(max_length=255, verbose_name='Title')
	language = models.ForeignKey('Languages', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Language')

class Questions(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Question"
		verbose_name_plural = "Questions"
	
	class Question_typeChoices(models.TextChoices):
		audio = ("audio", "Audio")
		fill_in_the_blank = ("fill_in_the_blank", " fill in the blank")
		choose_correct_option = ("choose_correct_option", " choose correct option")
	course = models.ForeignKey('Courses', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Course')
	question_type = models.CharField(max_length=21, choices=Question_typeChoices.choices, verbose_name='Question Type', default="choose correct option")
	prompt = models.CharField(max_length=255, verbose_name='Prompt')
	hint = models.CharField(max_length=255, blank=True, null=True, verbose_name='Hint')
	video = models.FileField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Video')
	audio = models.FileField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Audio')
	picture = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Picture')
	answer_options = models.JSONField(verbose_name='Answer Options')
	correct_answer = models.CharField(max_length=255, verbose_name='Correct Answer')

class Responses(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Response"
		verbose_name_plural = "Responses"

	question = models.ForeignKey('Questions', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Question')
	time_to_respond = models.IntegerField(verbose_name='Time to respond')
	answer = models.CharField(max_length=255, verbose_name='Answer')
	correct = models.BooleanField(default=False, verbose_name='Correct')
	score = models.IntegerField(default=0, verbose_name='Score')

class Certificates(SuperModel):
	class Meta:
		abstract = False
		verbose_name = "Certificate"
		verbose_name_plural = "Certificates"

	language = models.ForeignKey('Languages', on_delete=models.SET_NULL, related_name='+', null=True, verbose_name='Language')
	title = models.CharField(max_length=255, verbose_name='Title')
	description = models.CharField(max_length=255, blank=True, null=True, verbose_name='Description')
	icon = models.ImageField(upload_to=upload_file_path, blank=True, null=True, verbose_name='Icon')
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