from django.contrib import admin
from .models import Game


class GameAdmin(admin.ModelAdmin):
    list_display = ["date", "is_played", "player_creator", "player_opponent"]
    list_filter = ["date", "is_played"]


admin.site.register(Game, GameAdmin)
