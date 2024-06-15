
###OBJECT-ACTIONS-URLS-STARTS###
from django.conf import settings
from . import views
from rest_framework.routers import DefaultRouter
from django.urls import include, path
from django.contrib import admin
from rest_framework.schemas import get_schema_view
router = DefaultRouter()
router.register(r'api/customer', views.CustomerViewSet, basename='customer')
router.register(r'api/supplier', views.SupplierViewSet, basename='supplier')
router.register(r'api/ingredient', views.IngredientViewSet, basename='ingredient')
router.register(r'api/meal', views.MealViewSet, basename='meal')
router.register(r'api/plan', views.PlanViewSet, basename='plan')
router.register(r'api/order_item', views.OrderItemViewSet, basename='order_item')
router.register(r'api/order', views.OrderViewSet, basename='order')


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
    #path('', include(router.urls)),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.extend(router.urls)


###OBJECT-ACTIONS-URLS-ENDS###
