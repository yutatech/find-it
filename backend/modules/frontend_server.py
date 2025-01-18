from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import FastAPI
from pathlib import Path


class FrontendServer:
    def __init__(self):
        self.build_path = Path("build")
        self.valid_paths = {
            file.name: file for file in self.build_path.glob("*") if file.is_file()
        }

    def set_handlers(self, app: FastAPI):
        # Reactのindex.htmlをルートで返す
        @app.get("/")
        @app.get("/learningphasepage")
        @app.get("/inferencephasepage/labelselect")
        @app.get("/inferencephasepage/camera")
        @app.get("/learningphasepage/addphoto")
        @app.get("/learningphasepage/labelmanagement")
        @app.get("/learningphasepage/editphoto")
        def serve_react():
            return FileResponse("build/index.html")

        # Reactのビルドディレクトリを静的ファイルとしてマウント
        app.mount("/", StaticFiles(directory="build/"), name="static")
