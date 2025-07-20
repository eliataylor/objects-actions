import os
from urllib.parse import urlparse

from .base import myEnv, DJANGO_ENV

APP_HOST = os.getenv('REACT_APP_APP_HOST', 'https://localhost.oaexample.com:3000')
APP_HOST_PARTS = urlparse(APP_HOST)
API_HOST = os.getenv('REACT_APP_API_HOST', 'https://localapi.oaexample.com:8080')
API_HOST_PARTS = urlparse(API_HOST)

print(f"[OADJANGO] AllAuth using {APP_HOST} to {API_HOST}")

MFA_FORMS = {
    'authenticate': 'allauth.mfa.forms.AuthenticateForm',
    'reauthenticate': 'allauth.mfa.forms.AuthenticateForm',
    'activate_totp': 'allauth.mfa.forms.ActivateTOTPForm',
    'deactivate_totp': 'allauth.mfa.forms.DeactivateTOTPForm',
}

ACCOUNT_LOGOUT_ON_PASSWORD_CHANGE = False
ACCOUNT_LOGIN_BY_CODE_ENABLED = True
ACCOUNT_EMAIL_VERIFICATION = "optional"  # since SMS only is allowed
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_SESSION_REMEMBER = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_DISPLAY = lambda user: user.get_full_name()
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]

OPENAI_API_KEY = myEnv('OPENAI_API_KEY', 'NoKeySet')

if DJANGO_ENV != 'production':
    EMAIL_USE_SSL = False  # True if using SSL
    ACCOUNT_LOGIN_METHODS = {'email', 'username'}  # allow both for the sake of databuilder
    ACCOUNT_RATE_LIMITS = False
    ACCOUNT_SIGNUP_FIELDS = ["email*", "username*", "password1*", "password2*"]

HEADLESS_ONLY = True

DEFAULT_HTTP_PROTOCOL = API_HOST_PARTS.scheme

# LOGIN_REDIRECT_URL = f"{APP_HOST}/account/provider/callback"
# SIGNUP_REDIRECT_URL = f"{APP_HOST}/account/provider/callback"

HEADLESS_ADAPTER = 'oaexample_app.adapter.CustomHeadlessAdapter'
SOCIALACCOUNT_ADAPTER = 'oaexample_app.adapter.MySocialAccountAdapter'

# SOCIALACCOUNT_TOKEN_STRATEGY = 'oaexample_app.strategies.CustomTokenStrategy'
# ACCOUNT_ADAPTER = 'oaexample_app.adapter.UserAdapter'
# ACCOUNT_ADAPTER = 'allauth.account.adapter.DefaultAccountAdapter'

HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": f"{APP_HOST}/account/verify-email/{{key}}",
    # Key placeholders are automatically populated. You are free to adjust this to your own needs, e.g.
    "account_reset_password": f"{APP_HOST}/account/password/reset",
    "account_reset_password_from_key": f"{APP_HOST}/account/password/reset/key/{{key}}",
    "account_signup": f"{APP_HOST}/account/signup",
    # Fallback in case the state containing the `next` URL is lost and the handshake
    # with the third-party provider fails.
    "socialaccount_login_error": f"{APP_HOST}/account/provider/callback",
    "socialaccount_login_cancelled": f"{APP_HOST}/account/provider/callback"
}
HEADLESS_SERVE_SPECIFICATION = True
MFA_SUPPORTED_TYPES = ["totp", "recovery_codes", "webauthn"]
MFA_PASSKEY_LOGIN_ENABLED = True
MFA_PASSKEY_SIGNUP_ENABLED = False
# MFA_TRUST_ENABLED = True
if DJANGO_ENV != 'production':
    MFA_WEBAUTHN_ALLOW_INSECURE_ORIGIN = True

SOCIALACCOUNT_EMAIL_AUTHENTICATION = False
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
SOCIALACCOUNT_EMAIL_REQUIRED = False
SOCIALACCOUNT_EMAIL_VERIFICATION = False
SOCIALACCOUNT_STORE_TOKENS = True
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            "name": "google",
            "provider_id": "google",
            'client_id': myEnv('GOOGLE_OAUTH_CLIENT_ID', ""),
            'secret': myEnv('GOOGLE_OAUTH_SECRET', ""),
            'key': myEnv('GOOGLE_OAUTH_KEY', ""),
            'redirect_uri': f"{API_HOST}/accounts/google/login/callback/"
        },
        'EMAIL_AUTHENTICATION': True,
        'FETCH_USERINFO': True,
        "VERIFIED_EMAIL": True,
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
            'redirect_uri': f"{API_HOST}/accounts/google/login/callback/"
        }
    },
    'github': {
        'SCOPE': [
            'user'
        ],
        "VERIFIED_EMAIL": True,
        'APP': {
            "name": "github",
            "provider_id": "github",
            'client_id': myEnv('GITHUB_CLIENT_ID', ""),
            'secret': myEnv('GITHUB_SECRET', ""),
            'redirect_uri': f"{API_HOST}/accounts/github/login/callback/"
        },
        'AUTH_PARAMS': {
            'access_type': 'online',
            'redirect_uri': f"{API_HOST}/accounts/github/login/callback/"
        }
    },
    "openid_connect": {
        "APPS": [
            {
                "provider_id": "linkedin",
                "name": "LinkedIn",
                "client_id": myEnv('LINKEDIN_CLIENT_ID', ""),
                "secret": myEnv('LINKEDIN_SECRET', ""),
                'redirect_uri': f"{API_HOST}/accounts/oidc/linkedin/login/callback",
                "settings": {
                    "server_url": "https://www.linkedin.com/oauth",
                },
                'AUTH_PARAMS': {
                    'access_type': 'offline',
                    'redirect_uri': f"{API_HOST}/accounts/oidc/linkedin/login/callback"
                }
            }
        ]
    },
    "spotify": {
        'SCOPE': ['user-read-email'],
        'METHOD': 'oauth2',
        'FETCH_USERINFO': True,
        'VERIFIED_EMAIL': False,
        'VERSION': 'v1',
        "APP": {
            "name": "spotify",
            "provider_id": "spotify",
            "client_id": myEnv("SPOTIFY_CLIENT_ID"),
            "secret": myEnv("SPOTIFY_SECRET"),
            'redirect_uri': f"{API_HOST}/accounts/spotify/login/callback/",
            "settings": {
                "server_url": "https://accounts.spotify.com/authorize",
            },
        },
        'AUTH_PARAMS': {
            'access_type': 'offline',
            'redirect_uri': f"{API_HOST}/accounts/spotify/login/callback/"
        }
    }
}
