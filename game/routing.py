from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [
    url(r'^ws/game/(?P<game_name>[^/]+)/$', consumers.GameConsumer),
]