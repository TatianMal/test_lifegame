from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User

MIN_VALUE = 1
MAX_VALUE_ROUND = 7
MAX_VALUE_CELL = 20
MAX_VALUE_GEN = 10


def get_deleted_user():
    empty_user, created = User.objects.get_or_create(username="Empty user", password='emp2$UsEr#98')
    return empty_user.id


class Game(models.Model):
    date = models.DateTimeField('Created date')
    count_round = models.PositiveIntegerField(default=3, validators=[
        MinValueValidator(MIN_VALUE),
        MaxValueValidator(MAX_VALUE_ROUND)
    ])
    count_cell = models.PositiveIntegerField(default=6, validators=[
        MinValueValidator(MIN_VALUE),
        MaxValueValidator(MAX_VALUE_CELL)
    ])
    count_generation = models.PositiveIntegerField(default=3, validators=[
        MinValueValidator(MIN_VALUE),
        MaxValueValidator(MAX_VALUE_GEN)
    ])
    is_played = models.BooleanField(default=False)
    score_player1 = models.PositiveIntegerField(default=0)
    score_player2 = models.PositiveIntegerField(default=0)
    player_creator = models.ForeignKey(
        User,
        on_delete='CASCADE',
        related_name='game_to_creator',
        default=get_deleted_user
    )
    player_opponent = models.ForeignKey(
        User,
        on_delete='CASCADE',
        blank=True,
        null=True,
        related_name='game_to_opponent',
    )

    def __str__(self):
        return "Game_" + str(self.id)

    class Meta:
        verbose_name = 'Игра'
        verbose_name_plural = 'Игры'
