from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OasheetsSchemaGeneratorViewSet

AiRouter = DefaultRouter(trailing_slash=False)
AiRouter.register(r'worksheets', OasheetsSchemaGeneratorViewSet, basename='worksheets')

urlpatterns = [
    path('api/', include(AiRouter.urls)),
]
