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

        check_user = await self.check_game_users()

        if check_user:
            print(self.player)
            await self.channel_layer.group_add(
                self.game_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close(code=403)

    @database_sync_to_async
    def check_game_users(self):
        game = Game.objects.get(pk=self.game_id)
        self.game_creator_id = game.player_creator.id
        if game.player_creator.id == self.player.id:
            return True
        elif game.player_creator.id != self.player.id and game.player_opponent is None:
            game.player_opponent = User.objects.get(pk=self.player.id)
            game.is_closed = True
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
            score_creator = data_json.get("score_creator")
            score_opponent = data_json.get("score_opponent")
            await self.save_game(score_creator, score_opponent)

    @database_sync_to_async
    def save_game(self, score_creator, score_opp):
        game = Game.objects.get(pk=self.game_id)
        if not game.is_played:
            game.score_player1 = score_creator
            game.score_player2 = score_opp
            game.is_played = True
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


