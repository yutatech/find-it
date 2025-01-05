# from fastapi import FastAPI


# app = FastAPI()
# @app.get("/hello")
# async def root():
#     return {"message": "Hello World From Fast API"}
  
import main

server = main.FastApiServer(allow_origins=["https://yuta-air.local:3000"])
# socket_server = main.SocketServer(allow_origins=["https://yuta-air.local:3000"])
# socket_server.set_handlers(server.app)

app = server.app