from socketio.async_server import AsyncServer
from socketio.asgi import ASGIApp

from fastapi import FastAPI

from modules.session_controller import SessionController


class SocketServer:
    def __init__(self, session_controller: SessionController, allow_origins: list[str] = []):
        self.session_controller = session_controller
        
        # Socket.IOサーバーの設定
        self.sio = AsyncServer(
            async_mode="asgi",
            cors_allowed_origins=allow_origins,
        )
        
        self.sio.on("connect")(self.on_connect)
        self.sio.on("disconnect")(self.on_disconnect)

    def set_handlers(self, app: FastAPI):
        app.mount("/socket.io", ASGIApp(self.sio))
        
    def on_connect(self, sid, _):
        self.session_controller.create_session(sid)
        
    def on_disconnect(self, sid):
        self.session_controller.delete_session(sid)
