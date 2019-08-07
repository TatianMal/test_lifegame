from django.views.generic import ListView, FormView, DetailView
from django.urls import reverse
from django.utils import timezone

from .models import Game
from .forms import CreateGameForm


class GamesList(ListView):
    model = Game
    template_name = 'game/index.html'
    context_object_name = 'all_games'

    def get_queryset(self):
        return Game.objects.order_by('-date')


class GameCreateView(FormView):
    template_name = 'game/form_create_game.html'
    form_class = CreateGameForm

    def get_success_url(self):
        return reverse('game:game_full', kwargs={'pk': self.created_game.id})

    def form_valid(self, form):
        curr_game = Game(
            date=timezone.now(),
            is_played=False
        )
        form = CreateGameForm(self.request.POST, instance=curr_game)
        self.created_game = form.save()
        return super().form_valid(form)


class GameView(DetailView):
    model = Game
    template_name = 'game/game.html'
    context_object_name = 'game'
