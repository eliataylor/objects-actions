"""
path('schema/', get_schema_view(
    title="Your Project",
    description="API for all things …",
    version="1.0.0"
), name='openapi-schema')
"""

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api', include(router.urls)),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.extend(router.urls)
















