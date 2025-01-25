from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCConfiguration, RTCIceServer
from aiortc.rtcrtpreceiver import RemoteStreamTrack
from socketio.async_server import AsyncServer
import asyncio

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

    async def sio_handle_offer(self, sid, offer: dict):
        pc = RTCPeerConnection(configuration=RTCConfiguration(
            iceServers=[RTCIceServer(urls="stun:stun.l.google.com:19302")]))

        @pc.on("signalingstatechange")
        async def on_signalingstatechange():
            print('Signaling state change:', pc.signalingState)

        @pc.on('iceconnectionstatechange')
        async def on_iceconnectionstatechange():
            print("ICE connection state is", pc.iceConnectionState)

        @pc.on('connectionstatechange')
        async def on_connectionstatechange():
            print('Connection state change:', pc.connectionState)

        @pc.on('icegatheringstatechange')
        async def on_icegatheringstatechange():
            print('ICE gathering state changed to', pc.iceGatheringState)

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

    async def pc_handle_track(self, sid, pc: RTCPeerConnection,
                                track: RemoteStreamTrack):
        if track.kind == "video":
            while True:
                try:
                    frame = await track.recv()
                    # print(frame.dts, frame.pts, frame.time, frame.time_base)
                    # continue
                    if track._queue.empty():
                        if self.on_frame_received is not None:
                            result = self.on_frame_received(sid, frame)
                            await self.sio.emit("result", result, to=sid)
                            await asyncio.sleep(0.01)
                except Exception as e:
                    print("Error WebRtcServer.pc_handle_track():", e)
                    break

        @track.on("ended")
        async def on_ended():
            print("Track", track.kind, "ended")