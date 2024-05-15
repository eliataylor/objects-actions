###OBJECT-ACTIONS-URLS-STARTS###
router = DefaultRouter()
router.register(r'api/customer', CustomerViewSet, basename='customer')
router.register(r'api/supplier', SupplierViewSet, basename='supplier')
router.register(r'api/ingredient', IngredientViewSet, basename='ingredient')
router.register(r'api/meal', MealViewSet, basename='meal')
router.register(r'api/order_items', OrderItemsViewSet, basename='order_items')
router.register(r'api/plan', PlanViewSet, basename='plan')
router.register(r'api/order', OrderViewSet, basename='order')

###OBJECT-ACTIONS-URLS-ENDS###