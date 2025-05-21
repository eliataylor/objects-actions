import logging

from rest_framework.authentication import BaseAuthentication, SessionAuthentication, TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

"""
This class is only needed if you want to support Cookies for the WebApp and Tokens for the mobile app.
Tokens makes login possible from other install Apps that support OAuth login, since cookies cannot be shared from the WebView or native Browser
"""

class AuthenticationByDeviceType(BaseAuthentication):

    def authenticate(self, request):
        # Check if the view allows anonymous access (AllowAny permission)
        if self._allows_anonymous_access(request):
            return None  # Return None to bypass authentication

        if self.is_mobile(request) is True:
            token_auth = TokenAuthentication()
            result = token_auth.authenticate(request) # returns tuple (user, token)
            if not result or result[0] is None:
                raise AuthenticationFailed('Invalid token')
        else:
            session_auth = SessionAuthentication()
            result = session_auth.authenticate(request)
            if not result or result[0] is None:
                raise AuthenticationFailed('Session authentication failed')
        return result

    def _allows_anonymous_access(self, request):
        """
        Check if the endpoint allows anonymous access (e.g., AllowAny permission),
        for both class-based views (CBVs) and function-based views (FBVs).
        """
        # Extract the view or function handling the request
        resolver_match = request.resolver_match
        if resolver_match is None:
            logger.warning("resolver_match is None for the request path: %s", request.path)
            return False

        view = resolver_match.func

        # If it's a class-based view (CBV), check the permission_classes attribute
        if hasattr(view, 'view_class'):
            view_class = view.view_class
            permission_classes = getattr(view_class, 'permission_classes', [])
        else:
            # Function-based view (FBV), check the function's attributes for permission_classes
            permission_classes = getattr(view, 'permission_classes', [])

        # Check if any permission allows anonymous access
        for permission_class in permission_classes:
            if issubclass(permission_class, AllowAny):
                return True

        return False

    def is_mobile(self, request):
        x_app_client = request.META.get('HTTP_X_APP_CLIENT', '')

        is_mobile_webview = False

        if x_app_client == 'ios' or x_app_client == 'android':
            is_mobile_webview = True

        # Set custom flag on request for use later
        request.is_mobile_webview = is_mobile_webview
        return is_mobile_webview
