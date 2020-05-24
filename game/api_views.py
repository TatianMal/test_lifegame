from rest_framework import generics
from .models import Game
from .serializers import GameSerializer


class ListGameView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
