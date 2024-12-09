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


from socketio import AsyncServer, ASGIApp


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
from socketio import AsyncServer
import asyncio


class WebRtcServer:

    def __init__(self):
        self.pcs = {}
        self.sio = None

    def set_handlers(self, sio: AsyncServer):
        self.sio = sio

        @sio.on("offer")
        async def on_offer(sid, offer: dict):
            print('on_offer')
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
            await self.pc_handle_track(pc, track)

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

    async def pc_handle_track(self, pc: RTCPeerConnection,
                              track: RemoteStreamTrack):
        print('on_track')
        if track.kind == "video":
            while True:
                print("loop")
                frame = await track.recv()
                print(frame)
                await asyncio.sleep(0.01)

        @track.on("ended")
        async def on_ended():
            print("Track", track.kind, "ended")


if __name__ == "__main__":
    server = FastApiServer(allow_origins=["https://yuta-air.local:3000"])
    socket_server = SocketServer(allow_origins=["https://yuta-air.local:3000"])
    socket_server.set_handlers(server.app)
    web_rtc_server = WebRtcServer()
    web_rtc_server.set_handlers(socket_server.sio)

    import uvicorn
    uvicorn.run(server.app,
                host="0.0.0.0",
                port=8000,
                ssl_certfile="./yuta-air.local+1.pem",
                ssl_keyfile="./yuta-air.local+1-key.pem",
                log_level="debug")
