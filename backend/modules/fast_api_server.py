from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


class FastApiServer:

    def __init__(self, allow_origins: list[str]):
        """_summary_

        Args:
            allow_origins (list[str]): アクセスを許可するOriginのリスト
        """

        self.app = FastAPI()
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=allow_origins,  # ReactアプリのURL
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    