from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from fastapi import FastAPI, Request
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer

import cv2
import numpy as np
import av

from aiohttp import web
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder, MediaRelay
from av import VideoFrame

from aiortc.rtcrtpreceiver import RemoteStreamTrack

# Socket.IOサーバーの設定
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=["https://yuta-air.local:3000"],
    # logger=True,
)

pcs = set()
relay = MediaRelay()

# FastAPIアプリの設定
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yuta-air.local:3000"],  # ReactアプリのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/", socketio.ASGIApp(sio))


class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    from av.frame import Frame
    from av.video.reformatter import VideoReformatter
    kind = "video"

    def __init__(self, track: RemoteStreamTrack):
        super().__init__()  # don't forget this!
        self.track: RemoteStreamTrack = track

    async def recv(self):
        print("recv")
        frame:self.Frame = await self.track.recv()
        print("recv comp")
        # frame = self.VideoReformatter.reformat(frame, format="yuv420p", src_colorspace="bgr24", dst_colorspace="bgr24")
        # print(frame.color_space)
        frame = frame.reformat(format="rgb24")
        print(frame)
        
        # OpenCVで画像を表示
        img = frame.to_ndarray(format="bgr24")
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        cv2.imshow("Received Video", img)
        cv2.waitKey(1)  # OpenCVでフレーム表示を更新
        # print("saigo")
        return frame


# @sio.on("connect")
# async def connect(sid, environ):
#     print("connect ", sid)
#     await sio.emit("ready", to=sid)

# WebRTCのシグナリング処理
peer_connections = {}
@sio.on("offer")
async def handle_offer(sid, data):
    """
    クライアントから送信されたオファーを処理し、アンサーを返す
    """
    print(f"Received offer from client {sid}")
    
    # RTCPeerConnectionのインスタンスを作成
    pc = RTCPeerConnection()
    peer_connections[sid] = pc  # セッションIDで管理
    
    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        # print("Connection state is ", pc.connectionState)
        if pc.connectionState == "failed":
            await pc.close()
            pcs.discard(pc)
    
    @pc.on("track")
    def on_track(track: RemoteStreamTrack):
        # print("Track", track.kind, "received")
        if track.kind == "video":
            print("Receiving video track")
            # 映像を表示するために、例えばフレームを処理するなどの操作を行う
            # ここでは、標準出力に映像のストリームを受け取ったと表示するだけ
            # track.on("frame", lambda frame: print(f"Frame received: {frame}"))
            print(track)
            pc.addTrack(
                VideoTransformTrack(
                    relay.subscribe(track)
                )
            )
        
        @track.on("ended")
        async def on_ended():
            print("Track",track.kind,  "ended")

    # クライアントから送られたオファーを適用
    offer = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
    await pc.setRemoteDescription(offer)
    
    # サーバー側でアンサーを生成
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    
    # クライアントにアンサーを送信
    await sio.emit("answer", {
        "type": pc.localDescription.type,
        "sdp": pc.localDescription.sdp,
    }, to=sid)

    # print(f"Sent answer to client {sid}")
    
@sio.on("answer")
async def handle_answer(sid, data):
    print("receive answer")
    
@sio.on("ice_candidate")
async def handle_ice_candidate(sid, data):
    # print("Received ICE candidate:", data)
    await sio.emit("ice_candidate", data, room=sid)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, ssl_certfile="./yuta-air.local+1.pem", ssl_keyfile="./yuta-air.local+1-key.pem", log_level="debug")
    # uvicorn.run(app, host="0.0.0.0", port=8000)