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
            frame_queue = asyncio.Queue(maxsize=2)
            background_task = None
            async def process_frames_in_background():
                while True:
                    try:
                        # キューからフレームを取得（キューが空の場合は待機）
                        sid, frame = await frame_queue.get()

                        # 重い処理を実行（YOLO推論）
                        result = self.on_frame_received(sid, frame)

                        # 推論結果をクライアントに送信
                        await self.sio.emit("result", result, to=sid)

                        # フレーム処理を完了
                        frame_queue.task_done()
                    except Exception as e:
                        print("Error WebRtcServer.process_frames_in_background():", e)
                    
                
            # バックグラウンドタスクを開始
            if background_task is None:
                background_task = asyncio.create_task(process_frames_in_background())
            while True:
                try:
                    # 1. フレームを受信
                    frame = await track.recv()
                    print(frame.dts, frame.pts, frame.time, frame.time_base)

                    # フレームをキューに追加（キューが満杯なら古いフレームを削除）
                    if frame_queue.full():
                        try:
                            frame_queue.get_nowait()  # 古いフレームを削除
                        except asyncio.QueueEmpty:
                            pass
                    await frame_queue.put((sid, frame))  # フレームをキューに追加

                except Exception as e:
                    print("Error WebRtcServer.pc_handle_track():", e)
                    break

        @track.on("ended")
        async def on_ended():
            print("Track", track.kind, "ended")