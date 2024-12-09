from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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


import cv2
from aiortc import MediaStreamTrack
from aiortc.rtcrtpreceiver import RemoteStreamTrack
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
        frame: self.Frame = await self.track.recv()
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


from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaRelay


class WebRtcServer:
    def __init__(self):
        self.pcs = set()

    def set_handlers(self, app: FastAPI):

        @app.post("/offer")
        async def on_offer(offer: dict):
            return await self.handle_offer(offer)

        @app.post("/ice")
        async def on_ice(ice: dict):
            await self.handle_ice(ice)

    async def handle_offer(self, data: dict):
        print(data)
        offer = data['offer']
        pc = RTCPeerConnection()
        try:

            @pc.on("track")
            def handle_track(track: RemoteStreamTrack):
                if track.kind == "video":
                    print("Receiving video track")
                    print(track)

                    relay = MediaRelay()
                    pc.addTrack(VideoTransformTrack(relay.subscribe(track)))

                @track.on("ended")
                async def on_ended():
                    print("Track", track.kind, "ended")

            # リモートのOfferをセット
            remote_offer = RTCSessionDescription(sdp=offer['sdp'],
                                                 type=offer['type'])
            await pc.setRemoteDescription(remote_offer)

            # Answerを生成
            answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            self.pcs.add(pc)
            return {"answer": answer}
        except:
            print("Error WebRtcServer.handle_offer(): failed to create answer")
            await pc.close()
            raise

    async def handle_ice(self, data: dict):
        print("receive ice", data)
        ice = data['ice']
        # pc = self.pcs[ice['sid']]
        # if pc is None:
        #     print("Error WebRtcServer.handle_ice(): pc is None")
        #     return
        # await pc.addIceCandidate(ice["candidate"])


if __name__ == "__main__":
    server = FastApiServer(allow_origins=["https://yuta-air.local:3000"])
    web_rtc_server = WebRtcServer()
    web_rtc_server.set_handlers(server.app)
    import uvicorn
    uvicorn.run(server.app,
                host="0.0.0.0",
                port=8000,
                ssl_certfile="./yuta-air.local+1.pem",
                ssl_keyfile="./yuta-air.local+1-key.pem",
                log_level="debug")
