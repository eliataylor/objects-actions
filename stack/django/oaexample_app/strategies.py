# strategies.py

from allauth.headless.tokens.base import AbstractTokenStrategy
from allauth.socialaccount.models import SocialToken, SocialAccount

class CustomTokenStrategy(AbstractTokenStrategy):
    def store_token(self, request, token):
        user = request.user
        if user.is_authenticated:
            # Save the token in the database
            social_token, created = SocialToken.objects.update_or_create(
                account__user=user,
                account__provider=token.app.provider,
                defaults={
                    'token': token.token,
                    'token_secret': token.token_secret,
                    'expires_at': token.expires_at,
                },
            )

    def get_token(self, request, provider):
        user = request.user
        if user.is_authenticated:
            try:
                social_account = SocialAccount.objects.get(user=user, provider=provider)
                token = SocialToken.objects.get(account=social_account)
                return token
            except (SocialAccount.DoesNotExist, SocialToken.DoesNotExist):
                return None
        return None
