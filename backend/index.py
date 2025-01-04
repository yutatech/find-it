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
        @self.app.get("/hello")
        async def root():
            return {"message": "Hello World From Fast API"}


from socketio.async_server import AsyncServer
from socketio.asgi import ASGIApp


class SocketServer:

    def __init__(self, allow_origins: list[str]):
        # Socket.IOサーバーの設定
        self.sio = AsyncServer(
            async_mode="asgi",
            cors_allowed_origins=allow_origins,
        )

    def set_handlers(self, app: FastAPI):
        app.mount("/", ASGIApp(self.sio))


from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCConfiguration, RTCIceServer
from aiortc.rtcrtpreceiver import RemoteStreamTrack
from socketio.async_server import AsyncServer

class WebRtcServer:

    def __init__(self):
        self.pcs = {}
        self.sio = None
        self.on_frame_received = None

    def set_on_frame_received(self, on_frame_received):
        self.on_frame_received = on_frame_received

    def set_handlers(self, sio: AsyncServer):
        self.sio = sio

        @sio.on("offer")
        async def on_offer(sid, offer: dict):
            print('receive offer')
            answer = await self.sio_handle_offer(sid, offer)
            await sio.emit("answer", answer, to=sid)

        @sio.on("ice_candidate")
        async def on_ice(sid, ice: dict):
            print('on_ice')
            await self.sio_handle_ice(sid, ice)

    async def sio_handle_offer(self, sid, offer: dict):
        pc = RTCPeerConnection(configuration=RTCConfiguration(
            iceServers=[RTCIceServer(urls="stun:stun.l.google.com:19302")]))

        @pc.on("signalingstatechange")
        async def on_signalingstatechange():
            print('Signaling state change:', pc.signalingState)
            if pc.signalingState == 'stable':
                print('ICE gathering complete')

        @pc.on('iceconnectionstatechange')
        async def on_iceconnectionstatechange():
            print("ICE connection state is", pc.iceConnectionState)
            if pc.iceConnectionState == "failed":
                print("ICE Connection has failed, attempting to restart ICE")
                # await pc.restartIce()

        @pc.on('connectionstatechange')
        async def on_connectionstatechange():
            print('Connection state change:', pc.connectionState)
            if pc.connectionState == 'connected':
                print('Peers successfully connected')

        @pc.on('icegatheringstatechange')
        async def on_icegatheringstatechange():
            print('ICE gathering state changed to', pc.iceGatheringState)
            if pc.iceGatheringState == 'complete':
                print('All ICE candidates have been gathered.')

        @pc.on("track")
        async def handle_track(track: RemoteStreamTrack):
            print("receive track")
            await self.pc_handle_track(sid, pc, track)

        # リモートのOfferをセット
        await pc.setRemoteDescription(
            RTCSessionDescription(sdp=offer['sdp'], type=offer['type']))

        # Answerを生成
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        self.pcs[sid] = pc
        return {
            "type": pc.localDescription.type,
            "sdp": pc.localDescription.sdp,
        }

    async def sio_handle_ice(self, sid, ice: dict):
        # if sid not in self.pcs:
        #     print("Error WebRtcServer.handle_ice(): unknown sid")
        #     return
        # pc: RTCPeerConnection = self.pcs[sid]

        # ip = ice['candidate'].split(' ')[4]
        # port = ice['candidate'].split(' ')[5]
        # protocol = ice['candidate'].split(' ')[7]
        # priority = ice['candidate'].split(' ')[3]
        # foundation = ice['candidate'].split(' ')[0]
        # component = ice['candidate'].split(' ')[1]
        # protocol_type = ice['candidate'].split(' ')[7]
        # ice_candidate = RTCIceCandidate(ip=ip,
        #                                 port=port,
        #                                 protocol=protocol,
        #                                 priority=priority,
        #                                 foundation=foundation,
        #                                 component=component,
        #                                 type=protocol_type,
        #                                 sdpMid=ice['sdpMid'],
        #                                 sdpMLineIndex=ice['sdpMLineIndex'])
        # await pc.addIceCandidate(ice_candidate)
        # self.ice_candidates.append(ice_candidate)
        await self.sio.emit("ice_candidate", ice, to=sid)

    async def pc_handle_icecandidate(self, sid, pc: RTCPeerConnection,
                                     candidate: RTCIceCandidate):
        await self.sio.emit("ice", candidate, to=sid)

    async def pc_handle_track(self, sid, pc: RTCPeerConnection,
                              track: RemoteStreamTrack):
        if track.kind == "video":
            while True:
                try:
                    frame = await track.recv()
                    print(frame.dts, frame.pts, frame.time, frame.time_base)
                    # continue
                    if (track._queue.empty()):
                        if self.on_frame_received is not None:
                            result = self.on_frame_received(sid, frame)
                            await self.sio.emit("result", result, to=sid)
                except Exception as e:
                    print("Error WebRtcServer.pc_handle_track():", e)
                    break

        @track.on("ended")
        async def on_ended():
            print("Track", track.kind, "ended")


import math
from ultralytics import YOLO
import cv2

class VisionProcessor:
    def __init__(self):
        self.counter = 0
        # self.model = torch.hub.load("ultralytics/yolov8", "yolov8")
        self.model = YOLO("yolo11n.pt")
        print('load model complete')
    
    def on_frame_received(self, sid, frame):
        self.counter += 1
        
        try:
            # OpenCVで画像を表示
            img = frame.to_ndarray(format="rgb24")
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            
            cv2.imshow("Received Video", img)
            cv2.waitKey(1)  # OpenCVでフレーム表示を更新
            results = self.model(img)
        except Exception as e:
            print("Error VisionProcessor.on_frame_received():", e)
            return
        
        names = results[0].names
        classes = results[0].boxes.cls
        boxes = results[0].boxes
        annotatedFrame = results[0].plot()
  
  
        result_dict = []
        # print("\n\n\n")
        for box, cls in zip(boxes, classes):
            name = names[int(cls)]
            x1, y1, x2, y2 = [int(i) for i in box.xyxy[0]]
            # print(name, x1, y1, x2, y2)
            result_dict.append({
                "label": name,
                "box": [x1, y1, x2 - x1, y2 - y1]
            })
        return {
            "image_size": {'width': img.shape[1], 'height': img.shape[0]},
            "results": result_dict
        }
        
        x = math.sin(self.counter / 10) * 10
        y = math.cos(self.counter / 10) * 10
        return {
            "results": [
                {
                    "label": "person",
                    "confidence": 0.9,
                    "box": [x + 50, y + 50, 50, 50]
                },
                {
                    "label": "car",
                    "confidence": 0.8,
                    "box": [-x + 100, -y + 100, 50, 50]
                }
            ]
        }
    

if __name__ == "__main__":
    server = FastApiServer(allow_origins=["https://yuta-air.local:3000"])
    socket_server = SocketServer(allow_origins=["https://yuta-air.local:3000"])
    socket_server.set_handlers(server.app)
    # web_rtc_server = WebRtcServer()
    # web_rtc_server.set_handlers(socket_server.sio)
    # vision_processor = VisionProcessor()
    # web_rtc_server.set_on_frame_received(vision_processor.on_frame_received)

    import uvicorn
    uvicorn.run(server.app,
                host="0.0.0.0",
                port=8000,
                ssl_certfile="./webrtc-test.pem",
                ssl_keyfile="./webrtc-test-key.pem",
                log_level="debug")
