from django.urls import path
from . import views, api_views

app_name = "game"
urlpatterns = [
    path("", views.GamesList.as_view(), name="index"),
    path("create_game/", views.GameCreateView.as_view(), name="create_game"),
    path("game/<int:pk>", views.GameView.as_view(), name="game_full"),
    path("api/games", api_views.ListGameView.as_view(), name="api-games-all")
]
