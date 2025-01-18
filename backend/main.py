from modules.fast_api_server import FastApiServer
from modules.socket_server import SocketServer
from modules.web_rtc_server import WebRtcServer
from modules.vision_processor import VisionProcessor
from modules.frontend_server import FrontendServer
from modules.database import DataBase

if __name__ == "__main__":
    server = FastApiServer()
    socket_server = SocketServer()
    socket_server.set_handlers(server.app)

    web_rtc_server = WebRtcServer()
    web_rtc_server.set_handlers(socket_server.sio)

    vision_processor = VisionProcessor()
    web_rtc_server.set_on_frame_received(vision_processor.on_frame_received)

    database = DataBase()
    database.set_handlers(server.app)
    
    frontend_server = FrontendServer()
    frontend_server.set_handlers(server.app)
    
    server_url = "find-it.yutatech.jp"

    import uvicorn
    uvicorn.run(
        server.app,
        host="0.0.0.0",
        log_level="debug",
    )
