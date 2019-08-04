from django.db import models


class Game(models.Model):
    date = models.DateTimeField('Created date')
    count_round = models.IntegerField(default=3)
    count_cell = models.IntegerField(default=6)
    count_generation = models.IntegerField(default=3)
    is_played = models.BooleanField(default=False)
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)

    def __str__(self):
        return self.date

    class Meta:
        verbose_name = 'Игра'
        verbose_name_plural = 'Игры'