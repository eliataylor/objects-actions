from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OasheetsSchemaGeneratorViewSet

AiRouter = DefaultRouter(trailing_slash=False)
AiRouter.register(r'worksheet', OasheetsSchemaGeneratorViewSet, basename='worksheet')

urlpatterns = [
    path('api/', include(AiRouter.urls)),
]
