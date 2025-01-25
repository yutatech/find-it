from fastapi import FastAPI, Request, Header, HTTPException
from modules.session_controller import SessionController


class Api:
    def __init__(self, session_controller: SessionController):
        self.session_controller = session_controller

    def set_handlers(self, app: FastAPI):
        @app.get("/api/v1/items")
        async def on_get_items(request: Request):
            sid = request.headers.get("sid")
            print("on_get_items")
            print("  sid", sid)
            print("  items", self.session_controller.get_labels(sid))
            return {"items": self.session_controller.get_labels(sid)}

        @app.get("/api/v1/set_target_label")
        async def on_set_target_label(request: Request, target_label: str):
            sid = request.headers.get("sid")
            print("on_set_target_label")
            print("  sid", sid)
            print("  target_label", target_label)
            is_success = self.session_controller.set_target_label(sid, target_label)
            if is_success:
                return {"message": "success"}
            else:
                raise HTTPException(status_code=400, detail="Invalid sid")

        @app.get("/api/v1/get_target_label")
        async def on_get_target_label(request: Request):
            sid = request.headers.get("sid")
            target_label = self.session_controller.get_target_label(sid)
            print("on_get_target_label")
            print("  sid", sid)
            print("  target_label", target_label)
            return {"target_label": target_label}
