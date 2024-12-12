import os
from allauth.account.adapter import DefaultAccountAdapter
from utils.helpers import send_sms
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

"""
class UserAdapter(DefaultAccountAdapter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print(f"UserAdapter initialized! {os.environ.get('FRONTEND_URL')}")

    def get_redirect_url(self, request):
        print("SPECIAL DefaultAccountAdapter HANDLE ON CALLBACK! ")
        return f"{os.environ.get('FRONTEND_URL')}/"

    def save_user(self, request, user, form, commit=False):
        user = super().save_user(request, user, form, commit)
        data = form.cleaned_data
        user.phone_number = data.get('phone_number')
        user.save()
        return user

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        super().send_confirmation_mail( request, emailconfirmation, signup)
        activate_url = self.get_email_confirmation_url(request, emailconfirmation)
        user_phone_number = emailconfirmation.email_address.user.phone_number
        if user_phone_number:
            send_sms(user_phone_number, f"Thank you for your signing up, Please verify..\n{activate_url}")
        print(activate_url)
"""


from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def save_user(self, request, user, form, commit=False):
        user = super().save_user(request, user, form, commit)
        data = form.cleaned_data
        if data.get('phone_number') is not None:
            user.phone_number = data.get('phone_number')
            user.save()
        return user

    def save_token(self, request, sociallogin):
        print(f"MySocialAccountAdapter save_token {sociallogin.token}")
        token = sociallogin.token
        token.user = sociallogin.user
        token.app = sociallogin.token.app
        token.save()


# adapters.py

from allauth.headless.adapter import DefaultHeadlessAdapter
from allauth.socialaccount.models import SocialToken, SocialAccount

class CustomHeadlessAdapter(DefaultHeadlessAdapter):
    def pre_social_login(self, request, sociallogin):
        user = sociallogin.user
        if user.id:
            return  # User already exists, do nothing

        token = sociallogin.token
        if token:
            self.save_social_token(user, token, sociallogin.account.provider)

    def save_social_token(self, user, token, provider):
        # Save the token in the database
        social_token, created = SocialToken.objects.update_or_create(
            account__user=user,
            account__provider=provider,
            defaults={
                'token': token.token,
                'token_secret': token.token_secret,
                'expires_at': token.expires_at,
            },
        )
