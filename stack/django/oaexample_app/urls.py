####OBJECT-ACTIONS-URL-IMPORTS-STARTS####
from django.urls import re_path
from rest_framework.routers import DefaultRouter
from django.urls import include, path
from .views import UserModelListView
from .views import UserStatsView
from .views import RenderFrontendIndex
from .views import redirect_to_frontend
from .oa_testing import OATesterUserViewSet
from .views import TopicsViewSet
from .views import ResourceTypesViewSet
from .views import MeetingTypesViewSet
from .views import StatesViewSet
from .views import PartiesViewSet
from .views import StakeholdersViewSet
from .views import ResourcesViewSet
from .views import UsersViewSet
from .views import CitiesViewSet
from .views import OfficialsViewSet
from .views import RalliesViewSet
from .views import ActionPlansViewSet
from .views import MeetingsViewSet
from .views import InvitesViewSet
from .views import SubscriptionsViewSet
from .views import RoomsViewSet
from .views import AttendeesViewSet
####OBJECT-ACTIONS-URL-IMPORTS-ENDS####
urlpatterns = [path('', RenderFrontendIndex.as_view(), name='index')]

####OBJECT-ACTIONS-URLS-STARTS####

OARouter = DefaultRouter(trailing_slash=False)
OARouter.register(r'oa-testers', OATesterUserViewSet, basename='oa-tester')
OARouter.register('topics', TopicsViewSet, basename='topics')
OARouter.register('resource-types', ResourceTypesViewSet, basename='resource-types')
OARouter.register('meeting-types', MeetingTypesViewSet, basename='meeting-types')
OARouter.register('states', StatesViewSet, basename='states')
OARouter.register('parties', PartiesViewSet, basename='parties')
OARouter.register('stakeholders', StakeholdersViewSet, basename='stakeholders')
OARouter.register('resources', ResourcesViewSet, basename='resources')
OARouter.register('users', UsersViewSet, basename='users')
OARouter.register('cities', CitiesViewSet, basename='cities')
OARouter.register('officials', OfficialsViewSet, basename='officials')
OARouter.register('rallies', RalliesViewSet, basename='rallies')
OARouter.register('action-plans', ActionPlansViewSet, basename='action-plans')
OARouter.register('meetings', MeetingsViewSet, basename='meetings')
OARouter.register('invites', InvitesViewSet, basename='invites')
OARouter.register('subscriptions', SubscriptionsViewSet, basename='subscriptions')
OARouter.register('rooms', RoomsViewSet, basename='rooms')
OARouter.register('attendees', AttendeesViewSet, basename='attendees')

if urlpatterns is None:
    urlpatterns = []

urlpatterns += [
    re_path(r'^account/.*$', redirect_to_frontend, name='provider_callback_no_provider'), # note SINGULE account vs. accounts for allauth

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
