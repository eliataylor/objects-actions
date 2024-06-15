
###OBJECT-ACTIONS-URLS-STARTS###
from . import views
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'api/customer', views.CustomerViewSet, basename='customer')
router.register(r'api/supplier', views.SupplierViewSet, basename='supplier')
router.register(r'api/ingredient', views.IngredientViewSet, basename='ingredient')
router.register(r'api/meal', views.MealViewSet, basename='meal')
router.register(r'api/plan', views.PlanViewSet, basename='plan')
router.register(r'api/order_item', views.OrderItemViewSet, basename='order_item')
router.register(r'api/order', views.OrderViewSet, basename='order')

###OBJECT-ACTIONS-URLS-ENDS###
