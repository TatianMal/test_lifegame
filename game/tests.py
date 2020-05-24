from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APIClient, APIRequestFactory

from .models import Game
from .serializers import GameSerializer
from .api_views import ListGameView


class GameTests(APITestCase):
    client = APIClient()

    @staticmethod
    def create_game(date, count_round=3, count_cell=6, count_generation=3):
        Game.objects.create(date=date, count_round=count_round, count_cell=count_cell,
                            count_generation=count_generation)

    def setUp(self):
        self.create_game(timezone.now())
        self.create_game(timezone.now(), count_cell=4)
        self.create_game(timezone.now(), count_round=5)
        self.create_game(timezone.now(), count_generation=7)

    # def tearDown(self):
    #     pass

    def test_list_games(self):
        """
        This test ensures that all games added in the setUp method
        exist when we make a GET request to the games/ endpoint
        """
        url = reverse('game:api-games-all')
        response = self.client.get(url, format='json')
        # fetch the data from db
        expected = Game.objects.all()
        serialized = GameSerializer(expected, many=True)
        self.assertEqual(response.data, serialized.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_games_factory(self):
        """
        This test ensures that all games added in the setUp method
        exist when we make a GET request to the games/ endpoint
        """
        factory = APIRequestFactory()
        view = ListGameView.as_view()
        url = reverse('game:api-games-all')
        request = factory.get(url)
        response = view(request)
        expected = Game.objects.all()
        serialized = GameSerializer(expected, many=True)
        self.assertEqual(response.data, serialized.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
