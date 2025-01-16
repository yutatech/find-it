from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import FastAPI
from pathlib import Path


class FrontendServer:
    def __init__(self):
        self.build_path = Path("build")
        self.valid_paths = {file.name: file for file in self.build_path.glob("*") if file.is_file()}

    def set_handlers(self, app: FastAPI):
        # Reactのビルドディレクトリを静的ファイルとしてマウント
        app.mount("/static", StaticFiles(directory="build/static"), name="static")

        # Reactのindex.htmlをルートで返す
        @app.get("/")
        def serve_react():
            return FileResponse("build/index.html")
        
        @app.get("/{file_path}")
        async def serve_frontend(file_path: str,):
            """
            リクエストされたファイルが存在しない場合、index.html を返す。
            """
            if file_path in self.valid_paths:
                file_to_serve = self.valid_paths[file_path]
                if file_to_serve.exists() and file_to_serve.is_file():
                    return FileResponse(file_to_serve)
            
            return None
