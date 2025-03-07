####OBJECT-ACTIONS-URL-IMPORTS-STARTS####
from django.urls import re_path
from rest_framework.routers import DefaultRouter
from django.urls import include, path
from .views import UserModelListView
from .views import UserStatsView
from .views import RenderFrontendIndex
from .views import redirect_to_frontend
from .oa_testing import OATesterUserViewSet
from .views import PostTypeViewSet
from .views import DenominationViewSet
from .views import UsersViewSet
from .views import ChurchesViewSet
from .views import PostViewSet
from .views import EventsViewSet
from .views import ServicesViewSet
from .views import RequestedResourcesViewSet
from .views import AnnoucementsViewSet
from .views import MessagesViewSet
from .views import GroupsViewSet
####OBJECT-ACTIONS-URL-IMPORTS-ENDS####
urlpatterns = [path('', RenderFrontendIndex.as_view(), name='index')]

####OBJECT-ACTIONS-URLS-STARTS####

OARouter = DefaultRouter(trailing_slash=False)
OARouter.register(r'oa-testers', OATesterUserViewSet, basename='oa-tester')
OARouter.register('post-type', PostTypeViewSet, basename='post-type')
OARouter.register('denomination', DenominationViewSet, basename='denomination')
OARouter.register('users', UsersViewSet, basename='users')
OARouter.register('churches', ChurchesViewSet, basename='churches')
OARouter.register('post', PostViewSet, basename='post')
OARouter.register('events', EventsViewSet, basename='events')
OARouter.register('services', ServicesViewSet, basename='services')
OARouter.register('requested-resources', RequestedResourcesViewSet, basename='requested-resources')
OARouter.register('annoucements', AnnoucementsViewSet, basename='annoucements')
OARouter.register('messages', MessagesViewSet, basename='messages')
OARouter.register('groups', GroupsViewSet, basename='groups')

if urlpatterns is None:
    urlpatterns = []
    
urlpatterns += [
    re_path(r'^account/.*$', redirect_to_frontend, name='provider_callback_no_provider'),
        
    path('api/users/<int:user_id>/<str:model_name>/list', UserModelListView.as_view(), name='user-model-list'),
    path('api/users/<int:user_id>/<str:model_name>/stats', UserStatsView.as_view(), name='user-model-stats'),
    path('api/', include(OARouter.urls)),
]
####OBJECT-ACTIONS-URLS-ENDS####

from .views import SendCodeView, VerifyCodeView

urlpatterns += [
    path('objectactions/auth/sms', SendCodeView.as_view(), name='send_code'),
    path('objectactions/auth/verify-sms', VerifyCodeView.as_view(), name='verify_code'),
]