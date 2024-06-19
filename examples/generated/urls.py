###OBJECT-ACTIONS-URL-IMPORTS-STARTS###
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.urls import include, path
from django.contrib import admin
from rest_framework.schemas import get_schema_view
from .views import CustomerViewSet
from .views import SupplierViewSet
from .views import IngredientViewSet
from .views import MealViewSet
from .views import PlanViewSet
from .views import OrderItemViewSet
from .views import OrderViewSet
###OBJECT-ACTIONS-URL-IMPORTS-ENDS###

###OBJECT-ACTIONS-URLS-STARTS###

router = DefaultRouter()
router.register(r'api/customer', CustomerViewSet, basename='customer')
router.register(r'api/supplier', SupplierViewSet, basename='supplier')
router.register(r'api/ingredient', IngredientViewSet, basename='ingredient')
router.register(r'api/meal', MealViewSet, basename='meal')
router.register(r'api/plan', PlanViewSet, basename='plan')
router.register(r'api/order_item', OrderItemViewSet, basename='order_item')
router.register(r'api/order', OrderViewSet, basename='order')



"""
path('schema/', get_schema_view(
    title="Your Project",
    description="API for all things â€¦",
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


















###OBJECT-ACTIONS-URLS-ENDS###





































####OBJECT-ACTIONS-URL-IMPORTS-STARTS####
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.urls import include, path
from django.contrib import admin
from rest_framework.schemas import get_schema_view
from .views import CustomerViewSet
from .views import SupplierViewSet
from .views import IngredientViewSet
from .views import MealViewSet
from .views import PlanViewSet
from .views import OrderItemViewSet
from .views import OrderViewSet
####OBJECT-ACTIONS-URL-IMPORTS-ENDS####



####OBJECT-ACTIONS-URLS-STARTS####

router = DefaultRouter()
router.register(r'api/customer', CustomerViewSet, basename='customer')
router.register(r'api/supplier', SupplierViewSet, basename='supplier')
router.register(r'api/ingredient', IngredientViewSet, basename='ingredient')
router.register(r'api/meal', MealViewSet, basename='meal')
router.register(r'api/plan', PlanViewSet, basename='plan')
router.register(r'api/order_item', OrderItemViewSet, basename='order_item')
router.register(r'api/order', OrderViewSet, basename='order')

"""
path('schema/', get_schema_view(
    title="Your Project",
    description="API for all things â€¦",
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

















####OBJECT-ACTIONS-URLS-ENDS####

