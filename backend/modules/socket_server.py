from socketio.async_server import AsyncServer
from socketio.asgi import ASGIApp

from fastapi import FastAPI


class SocketServer:

    def __init__(self, allow_origins: list[str]):
        # Socket.IOサーバーの設定
        self.sio = AsyncServer(
            async_mode="asgi",
            cors_allowed_origins=allow_origins,
        )

    def set_handlers(self, app: FastAPI):
        app.mount("/", ASGIApp(self.sio))
