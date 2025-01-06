from fastapi import FastAPI

class DataBase:
    def __init__(self):
        pass
    
    def set_handlers(self, app: FastAPI):
        @app.get("/api/v1/items")
        async def on_get_items():
            return {"items": ["item1", "item2", "item3"]}