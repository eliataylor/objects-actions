from django.urls import include, path
from django.contrib import admin
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Even when using headless, the third-party provider endpoints are still
    # needed for handling e.g. the OAuth handshake. The account views
    # can be disabled using `HEADLESS_ONLY = True`.
    path("accounts/", include("allauth.urls")),

    # Include the API endpoints:
    path("_allauth/", include("allauth.headless.urls")),

    path('', include("oaexample_app.urls")),

    # YOUR PATTERNS
    path('api/schema', SpectacularAPIView.as_view(), name='schema'),

    # Optional UI:
    path('api/schema/swagger', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger'),
    path('api/schema/redoc', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

]

if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
