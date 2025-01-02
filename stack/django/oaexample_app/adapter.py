import logging
logger = logging.getLogger(__name__)
from allauth.headless.adapter import DefaultHeadlessAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

"""
class UserAdapter(DefaultAccountAdapter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print(f"UserAdapter initialized! {os.environ.get('REACT_APP_APP_HOST')}")

    def get_redirect_url(self, request):
        print("SPECIAL DefaultAccountAdapter HANDLE ON CALLBACK! ")
        return f"{os.environ.get('REACT_APP_APP_HOST')}/"

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


class CustomHeadlessAdapter(DefaultHeadlessAdapter):
    def serialize_user(self, user, **kwargs):
        # Call the original method to get the default serialized data
        user_data = super().serialize_user(user, **kwargs)

        # TODO: find first Image field type on Users model
        if hasattr(user, 'profile_picture'):
            user_data['profile_picture'] = user.profile_picture.url if user.profile_picture else None
        elif hasattr(user, 'picture'):
            user_data['picture'] = user.picture.url if user.picture else None
        elif hasattr(user, 'image'):
            user_data['image'] = user.image.url if user.image else None
        elif hasattr(user, 'cover'):
            user_data['cover'] = user.cover.url if user.cover else None

        if hasattr(user, 'groups'):
            user_data['groups'] = list(user.groups.values_list("name", flat=True))

        return user_data



class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def save_user(self, request, user, form=None):
        user = super().save_user(request, user, form)
        if form:
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

    def populate_user(self, request, sociallogin, common_fields):
        logger.info("POPULATE USER - SOCIAL ADAPTER")
        logger.info(sociallogin)
        logger.info(common_fields)
        """
        sociallogin.account.extra_data = {'display_name': '1210368404', 'external_urls': {'spotify': 'https://open.spotify.com/user/1210368404'}, 'href': 'https://api.spotify.com/v1/users/1210368404', 'id': '1210368404', 'images': [], 'type': 'user', 'uri': 'spotify:user:1210368404', 'followers': {'href': None, 'total': 33}, 'email': 'eli@taylormadetraffic.com'}
        """

