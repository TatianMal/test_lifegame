from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
import json

from game.models import Game


class GameConsumer(AsyncWebsocketConsumer):

    current_turn = None
    ready_to_update = [False, False]
    next = [False, False]
    player = None
    opponent = None

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.player = self.scope["user"]
        self.game_group_name = 'game_%s' % self.game_id

        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

        check_user = await self.check_game_users()

        print("I'm joined")
        if check_user:
            await self.accept()
        else:
            await self.close(code=403)

    @database_sync_to_async
    def check_game_users(self):
        print("hello")
        game = Game.objects.get(pk=self.game_id)
        if game.player_creator == self.player.id:
            return True
        elif game.player_creator != self.player.id and game.player_opponent is None:
            # self.opponent = game.player_creator
            game.player_opponent = User.objects.get(pk=self.player.id)
            game.save()
            return True
        return False

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))


# self.game_data = await database_sync_to_async(self.get_game_data)()
#
# await self.send(text_data=json.dumps(self.game_data))
#     def get_game_data(self):
#         game = Game.objects.get(pk=self.game_id)
#         settings = {
#             "count_round": game.count_round,
#             "count_cell": game.count_cell,
#             "count_generation": game.count_generation,
#         }
#         return settings


# async def disconnect(self, close_code):
    #     await self.channel_layer.group_discard(
    #         self.game_group_name,
    #         self.channel_name
    #     )
    #
    # Receive message from WebSocket