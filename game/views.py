from django.views.generic import ListView, FormView

from .models import Game


class GamesList(ListView):
    model = Game
    template_name = 'game/index.html'
    context_object_name = 'all_games'

    def get_queryset(self):
        return Game.objects.order_by('-date')

