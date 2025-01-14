from modules.fast_api_server import FastApiServer
from modules.socket_server import SocketServer
from modules.web_rtc_server import WebRtcServer
from modules.vision_processor import VisionProcessor
from modules.frontend_server import FrontendServer
from modules.database import DataBase
import socket
import platform
import subprocess


def get_host_name():
    system_name = platform.system()
    if system_name == "Darwin":  # macOS
        print("macOS")
        result = subprocess.run(
            ["scutil", "--get", "LocalHostName"], text=True, capture_output=True
        )
        # 結果を取得（stdoutに出力される）
        hostname = result.stdout.strip() + ".local"
    elif system_name == "Linux":  # Linux
        print("Linux")
        hostname = socket.gethostname()
    elif system_name == "Windows":  # Windows
        print("Windows")
        hostname = socket.gethostname()
    else:
        print("Unknown OS")

    print(f"https://{hostname}:3000")
    return hostname

if __name__ == "__main__":
    hostname = get_host_name()
    server = FastApiServer(
        allow_origins=["https://localhost:3000", f"https://{hostname}:3000"]
    )
    socket_server = SocketServer(
        allow_origins=["https://localhost:3000", f"https://{hostname}:3000"]
    )
    socket_server.set_handlers(server.app)

    web_rtc_server = WebRtcServer()
    web_rtc_server.set_handlers(socket_server.sio)

    vision_processor = VisionProcessor()
    web_rtc_server.set_on_frame_received(vision_processor.on_frame_received)

    frontend_server = FrontendServer()
    frontend_server.set_handlers(server.app)

    database = DataBase()
    database.set_handlers(server.app)

    import uvicorn

    uvicorn.run(
        server.app,
        host="0.0.0.0",
        port=8000,
        ssl_certfile="./webrtc-test.pem",
        ssl_keyfile="./webrtc-test-key.pem",
        log_level="debug",
    )
