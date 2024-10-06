
####OBJECT-ACTIONS-URL-IMPORTS-STARTS####
from rest_framework.routers import DefaultRouter
from django.urls import include, path
from .views import UserModelListView
from .views import UserStatsView
from .views import RenderFrontendIndex
from .views import redirect_to_frontend
from .views import migrate, collectstatic
from .views import UsersViewSet
from .views import SongsViewSet
from .views import PlaylistsViewSet
from .views import EventsViewSet
from .views import EventsAliasView
from .views import FriendshipsViewSet
from .views import InvitesViewSet
from .views import SongRequestsViewSet
from .views import EventCheckinsViewSet
from .views import LikesViewSet
####OBJECT-ACTIONS-URL-IMPORTS-ENDS####

from .spotify import SpotifyViewSet

connRouters = DefaultRouter()
connRouters.register(r'spotify', SpotifyViewSet, basename='spotify')

urlpatterns = [path('', RenderFrontendIndex.as_view(), name='index')]

####OBJECT-ACTIONS-URLS-STARTS####
OARouter = DefaultRouter()
OARouter.register('users', UsersViewSet, basename='users')
OARouter.register('songs', SongsViewSet, basename='songs')
OARouter.register('playlists', PlaylistsViewSet, basename='playlists')
OARouter.register('events', EventsViewSet, basename='events')
OARouter.register('friendships', FriendshipsViewSet, basename='friendships')
OARouter.register('invites', InvitesViewSet, basename='invites')
OARouter.register('song_requests', SongRequestsViewSet, basename='song_requests')
OARouter.register('event_checkins', EventCheckinsViewSet, basename='event_checkins')
OARouter.register('likes', LikesViewSet, basename='likes')

if urlpatterns is None:
    urlpatterns = []
    
urlpatterns += [
    path('account/provider/callback/', redirect_to_frontend, name='provider_callback_no_provider'),
    path('u/events/<slug:url_alias>/', EventsAliasView.as_view(), name='events-alias-view'),    
    path('api/users/<int:user_id>/<str:model_name>/', UserModelListView.as_view(), name='user-model-list'),
    path('api/users/<int:user_id>/<str:model_name>/stats/', UserStatsView.as_view(), name='user-model-stats'),

    path('migrate/', migrate, name='migrate'),
    path('collectstatic/', collectstatic, name='collectstatic'),
    path('api/', include(OARouter.urls)),
]
####OBJECT-ACTIONS-URLS-ENDS####


from .views import SendCodeView, VerifyCodeView

urlpatterns += [
    path('connectors/', include(connRouters.urls)),

    path('objectactions/auth/sms', SendCodeView.as_view(), name='send_code'),
    path('objectactions/auth/verify-sms', VerifyCodeView.as_view(), name='verify_code'),

#    path('account/<str:provider>/login/callback/', redirect_to_frontend, name='provider_callback'),
    # path('accounts/<str:provider>/login/callback/', IndexView.as_view(), name='provider_callback'),
    # path('accounts/login/callback/', IndexView.as_view(), name='provider_callback_no_provider'),

]



















