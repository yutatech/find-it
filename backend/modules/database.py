from fastapi import FastAPI

class DataBase:
    def __init__(self):
        self.labels = []
        self.current_label = None
    
    def set_handlers(self, app: FastAPI):
        @app.get("/api/v1/items")
        async def on_get_items():
            print("on_get_items", self.labels)
            return {"items": self.labels}