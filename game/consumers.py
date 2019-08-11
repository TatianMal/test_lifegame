from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
import json

from game.models import Game

COUNT_READY_USER_TO_NEW_ROUND = 2


class GameConsumer(AsyncWebsocketConsumer):

    player = None
    opponent = None
    game_creator_id = None

    async def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.player = self.scope["user"]
        self.game_group_name = "game_%s" % self.game_id

        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

        check_user = await self.check_game_users()

        await self.accept()
        # if check_user:
        #     await self.accept()
        # else:
        #     await self.close(code=403)

    @database_sync_to_async
    def check_game_users(self):
        print("hello")
        game = Game.objects.get(pk=self.game_id)
        self.game_creator_id = game.player_creator.id
        if game.player_creator.id == self.player.id:
            return True
        elif game.player_creator.id != self.player.id and game.player_opponent is None:
            # self.opponent = game.player_creator
            game.player_opponent = User.objects.get(pk=self.player.id)
            game.save()
            return True
        return False

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "notice_leave",
            }
        )
        await self.channel_layer.group_discard(
                self.game_group_name,
                self.channel_name
        )

    async def receive(self, text_data):
        data_json = json.loads(text_data)

        if data_json.get("cell") is not None:
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "send_cell",
                    "cell": data_json.get("cell"),
                    "user": data_json.get("user")
                }
            )

        elif data_json.get("gen") is not None:
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "send_gen",
                    "gen": data_json.get("gen"),
                    "user": data_json.get("user")
                }
            )

        elif data_json.get("pl_ready") is not None:
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "notice_ready",
                    "user": data_json.get("user")
                }
            )

        elif data_json.get("result") is not None:
            score = data_json.get("score")
            user = data_json.get("user")

            # insert data in game

    @database_sync_to_async
    def save_game(self):
        game = Game.objects.get(pk=self.game_id)
        # add score
        game.is_played = True
        game.player_opponent = User.objects.get(pk=self.player.id)
        game.save()

    async def send_cell(self, event):
        cell = event["cell"]
        await self.send(text_data=json.dumps({
            "cell": cell,
            "user": event["user"]
        }))

    async def send_gen(self, event):
        gen = event["gen"]
        await self.send(text_data=json.dumps({
            "gen": gen,
            "user": event["user"]
        }))

    async def notice_leave(self, event):
        await self.send(text_data=json.dumps({
            "game_over": True
        }))

    async def notice_ready(self, event):
        await self.send(text_data=json.dumps({
            "opponent_ready": True,
            "user": event["user"]
        }))


