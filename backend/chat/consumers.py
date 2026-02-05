"""
Trutim WebSocket Consumers - Live Chat & WebRTC Signaling
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """Handles live chat messages and presence."""

    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        await self.update_user_online(True)
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'user_joined', 'user': await self.user_data()}
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.update_user_online(False)
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'user_left', 'user': await self.user_data()}
            )
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type', 'message')

        if msg_type == 'message':
            content = data.get('content', '').strip()
            if content:
                msg = await self.save_message(content)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {'type': 'chat_message', 'message': msg}
                )
        elif msg_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'user_typing', 'user': await self.user_data(), 'typing': data.get('typing', True)}
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'message', 'message': event['message']}))

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({'type': 'user_joined', 'user': event['user']}))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({'type': 'user_left', 'user': event['user']}))

    async def user_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing', 'user': event['user'], 'typing': event['typing']
        }))

    @database_sync_to_async
    def save_message(self, content):
        from .models import Message, Room
        room = Room.objects.get(id=self.room_id)
        msg = Message.objects.create(room=room, sender=self.user, content=content)
        return {
            'id': msg.id,
            'content': msg.content,
            'created_at': msg.created_at.isoformat(),
            'sender': {'id': self.user.id, 'username': self.user.username, 'title': self.user.title or ''},
            'reactions': msg.reactions
        }

    @database_sync_to_async
    def update_user_online(self, online):
        User.objects.filter(id=self.user.id).update(online=online)

    @database_sync_to_async
    def user_data(self):
        return {'id': self.user.id, 'username': self.user.username, 'title': self.user.title or ''}


class CallConsumer(AsyncWebsocketConsumer):
    """WebRTC signaling for video calls and screen sharing."""

    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'call_{self.room_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'call_leave', 'user_id': self.user.id, 'channel': self.channel_name}
            )
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type')

        payload = {
            'type': msg_type,
            'from_user': await self.user_data(),
            **{k: v for k, v in data.items() if k != 'type'}
        }

        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'call_signal',
            'payload': payload,
            'exclude_channel': self.channel_name
        })

    async def call_signal(self, event):
        if event.get('exclude_channel') == self.channel_name:
            return
        await self.send(text_data=json.dumps(event['payload']))

    async def call_leave(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id']
        }))

    @database_sync_to_async
    def user_data(self):
        return {'id': self.user.id, 'username': self.user.username, 'title': self.user.title or ''}
