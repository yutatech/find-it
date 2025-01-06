from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import FastAPI


class FrontendServer:
    def __init__(self):
        pass

    def set_handlers(self, app: FastAPI):
        # Reactのビルドディレクトリを静的ファイルとしてマウント
        app.mount("/static", StaticFiles(directory="build/static"), name="static")

        # Reactのindex.htmlをルートで返す
        @app.get("/")
        def serve_react():
            return FileResponse("build/index.html")
