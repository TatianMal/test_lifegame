from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

MIN_VALUE = 1
MAX_VALUE_ROUND = 7
MAX_VALUE_CELL = 20
MAX_VALUE_GEN = 10


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

    def __str__(self):
        return "Game_" + str(self.id)

    class Meta:
        verbose_name = 'Игра'
        verbose_name_plural = 'Игры'