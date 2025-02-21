from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SchemaVersionsViewSet

AiRouter = DefaultRouter(trailing_slash=False)
AiRouter.register(r'worksheets', SchemaVersionsViewSet, basename='worksheets')

urlpatterns = [
    path('api/', include(AiRouter.urls)),
]
