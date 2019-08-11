from django.views.generic import ListView, FormView, DetailView
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from django.utils.safestring import mark_safe
import json

from .models import Game
from .forms import CreateGameForm


class AuthMixin(object):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("account:sign_up"))
        return super(AuthMixin, self).dispatch(request, *args, **kwargs)


class GamesList(AuthMixin, ListView):
    model = Game
    template_name = "game/index.html"
    context_object_name = "all_games"

    def get_queryset(self):
        return Game.objects.order_by("-date")


class GameCreateView(AuthMixin, FormView):
    template_name = "game/form_create_game.html"
    form_class = CreateGameForm

    def get_success_url(self):
        return reverse("game:game_full", kwargs={"pk": self.created_game.id})

    def form_valid(self, form):
        user_creator = User.objects.get(pk=self.request.POST["player_creator"])
        curr_game = Game(
            date=timezone.now(),
            is_played=False,
            player_creator=user_creator
        )
        form = CreateGameForm(self.request.POST, instance=curr_game)
        self.created_game = form.save()
        return super().form_valid(form)


class GameView(AuthMixin, DetailView):
    model = Game
    template_name = "game/game.html"
    context_object_name = "game"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['game_id_json'] = mark_safe(json.dumps(self.object.pk))
        context['count_round'] = mark_safe(json.dumps(self.object.count_round))
        context['count_cell'] = mark_safe(json.dumps(self.object.count_cell))
        context['count_generation'] = mark_safe(json.dumps(self.object.count_generation))
        return context
