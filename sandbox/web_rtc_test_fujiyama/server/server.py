from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from fastapi import FastAPI, Request
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer

import cv2
import numpy as np

from aiohttp import web
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder, MediaRelay
from av import VideoFrame

# Socket.IOサーバーの設定
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[],
)

pcs = set()
relay = MediaRelay()

# FastAPIアプリの設定
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ReactアプリのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/", socketio.ASGIApp(sio))


class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    kind = "video"

    def __init__(self, track, transform="cartoon"):
        super().__init__()  # don't forget this!
        self.track = track
        self.transform = transform

    async def recv(self):
        print("recv")
        frame = await self.track.recv()
        
        # OpenCVで画像を表示
        img = frame.to_ndarray(format="bgr24")
        cv2.imshow("Received Video", img)
        cv2.waitKey(1)  # OpenCVでフレーム表示を更新
        return frame

        if self.transform == "cartoon":
            img = frame.to_ndarray(format="bgr24")

            # prepare color
            img_color = cv2.pyrDown(cv2.pyrDown(img))
            for _ in range(6):
                img_color = cv2.bilateralFilter(img_color, 9, 9, 7)
            img_color = cv2.pyrUp(cv2.pyrUp(img_color))

            # prepare edges
            img_edges = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
            img_edges = cv2.adaptiveThreshold(
                cv2.medianBlur(img_edges, 7),
                255,
                cv2.ADAPTIVE_THRESH_MEAN_C,
                cv2.THRESH_BINARY,
                9,
                2,
            )
            img_edges = cv2.cvtColor(img_edges, cv2.COLOR_GRAY2RGB)

            # combine color and edges
            img = cv2.bitwise_and(img_color, img_edges)

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        elif self.transform == "edges":
            # perform edge detection
            img = frame.to_ndarray(format="bgr24")
            img = cv2.cvtColor(cv2.Canny(img, 100, 200), cv2.COLOR_GRAY2BGR)

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        elif self.transform == "rotate":
            # rotate image
            img = frame.to_ndarray(format="bgr24")
            rows, cols, _ = img.shape
            M = cv2.getRotationMatrix2D((cols / 2, rows / 2), frame.time * 45, 1)
            img = cv2.warpAffine(img, M, (cols, rows))

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        else:
            return frame






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
        print("Connection state is ", pc.connectionState)
        if pc.connectionState == "failed":
            await pc.close()
            # pcs.discard(pc)
    
    @pc.on("track")
    def on_track(track):
        print("Track", track.kind, "received")
        if track.kind == "video":
            print("Receiving video track")
            # 映像を表示するために、例えばフレームを処理するなどの操作を行う
            # ここでは、標準出力に映像のストリームを受け取ったと表示するだけ
            # track.on("frame", lambda frame: print(f"Frame received: {frame}"))
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

    print(f"Sent answer to client {sid}")
    
@sio.on("answer")
async def handle_answer(sid, data):
    print("receive answer")
    
@sio.on("ice_candidate")
async def handle_ice_candidate(sid, data):
    print("Received ICE candidate:", data)
    await sio.emit("ice_candidate", data, room=sid)

# @sio.on("video_stream")
# async def handle_video_stream(sid, data):
#     """映像データを受信して表示する"""
#     print("received video stream")
#     # 映像データは通常バイナリ形式で送られてきます
#     nparr = np.frombuffer(data, np.uint8)
#     img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#     # OpenCVで受信した映像を表示
#     if img is not None:
#         cv2.imshow("Received Video", img)
#         cv2.waitKey(1)  # 1msの待機で表示を更新

if __name__ == "__main__":
    import uvicorn
    # uvicorn.run(app, host="0.0.0.0", port=8000, ssl_certfile="server.crt", ssl_keyfile="server.key")
    uvicorn.run(app, host="0.0.0.0", port=8000)