import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import { Fetch, WebSocket } from "engine.io-client";

const server_url = "https://yuta-air.local:8000";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const socketRef = useRef(null);

  // クライアントがWebSocketでサーバーに接続する際の設定
  useEffect(() => {
    console.log("on useEffect");
    // Socket.IOサーバーへの接続
    socketRef.current = io(server_url, {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketRef.current.on('answer', (data) => {
      console.log('Received answer:', data);
      handleAnswer(data);
    });

    // WebRTCのセットアップ
    const startWebRTC = async () => {
      try {
        // カメラの取得
        document.getElementById('log').innerText = 'waiting';
        await navigator.mediaDevices.getUserMedia({ video: { width: 360, height: 240, facingMode: 'user' }, audio: false })
        .then((stream) => { 
          localStreamRef.current = stream;
          // ストリームを適切に処理
          document.getElementById('log').innerText = 'success to get media';
        })
        .catch((error) => {
          console.error('メディアデバイスの取得エラー:', error);
          document.getElementById('log').innerText = 'fail to get media';
        });
      } catch (err) {
        console.error('Error accessing media devices.', err);
      }
    };

    startWebRTC();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // オファーをサーバーに送信
  const sendOffer = async () => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }  // GoogleのSTUNサーバー
      ],
    });

    // ローカルのストリームをWebRTC接続に追加
    localStreamRef.current.getTracks().forEach((track) => {
      // console.log('Adding local track:', track);
      const sender = peerConnectionRef.current.addTrack(track, localStreamRef.current);

        // // フォーマットの設定
        // const params = sender.getParameters();
        // if (!params.encodings) {
        //     params.encodings = [{}];
        // }

        // // 送信フォーマットの例
        // params.encodings[0].maxBitrate = 500000; // 最大ビットレート
        // params.encodings[0].scaleResolutionDownBy = 1; // 解像度をそのまま使用
        // sender.setParameters(params);
    });

    // ICE Candidateの処理
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to other peer:', event.candidate);
        socketRef.current.emit('ice_candidate', event.candidate);
      }
    };

    // リモートストリームを表示
    peerConnectionRef.current.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
    };

    // オファーを作成
    const offer = await peerConnectionRef.current.createOffer();
    // let modifiedSDP = offer.sdp;
    // modifiedSDP = modifiedSDP.replace(
    //   /a=rtpmap:(\d+) H264\/90000[\s\S]*?a=fmtp:\1 [^\r\n]*/g,
    //   match => {
    //       return match.replace(
    //           /profile-level-id=[a-fA-F0-9]+/,
    //           "profile-level-id=42e01f"
    //       );
    //   }
    // );

    await peerConnectionRef.current.setLocalDescription(offer);

    // サーバーにオファーを送信
    socketRef.current.emit('offer', {
      type: offer.type,
      sdp: offer.sdp,
    });
    setIsConnected(true);

    // peerConnectionRef.current.addEventListener('signalingstatechange', (event) => {
    //   console.log('Connection state change:', event);
    // });
  };

  // サーバーから受け取ったアンサーを処理
  const handleAnswer = async (data) => {
    const answer = new RTCSessionDescription({
      type: data.type,
      sdp: data.sdp,
    });
    await peerConnectionRef.current.setRemoteDescription(answer);
    console.log('Connection established successfully!');

    document.getElementById('localVideo').srcObject = localStreamRef.current;
  };

  // オファーの送信ボタン
  return (
    <div>
      <h1>WebRTC Video Call</h1>
      <video id="localVideo" autoPlay muted width="300" height="200" />
      {/* <video id="remoteVideo" autoPlay width="300" height="200" /> */}
      <div>
        {isConnected ? (
          <p>Connected</p>
        ) : (
          <button onClick={sendOffer}>Start Call</button>
        )}
      </div>
      <div id="log">no</div>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={() => socketRef.current.emit('message', message)}>
          Send Message
        </button>
      </div>
    </div>
  );
}

// function App() {
//   const [peer, setPeer] = useState(null);
//   const localVideoRef = useRef(null);

//   useEffect(() => {
//     // カメラ映像の取得
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//       if (!localVideoRef.current) {
//         return;
//       }
//       localVideoRef.current.srcObject = stream;
//       localVideoRef.current.play();

//       console.log("stream", stream);

//       // Peerの初期化
//       const p = new Peer({ initiator: true, trickle: false, stream });
//       setPeer(p);

//       // シグナリング処理
//       p.on("signal", (data) => {
//         socket.emit("offer", data);
//         console.log("get signal");
//       });

//       socket.on("answer", (data) => {
//         console.log("answer", data);
//         p.signal(data);
//         console.log("get answer");
//       });
//     });
//   }, []);

//   return (
//     <div>
//       <h1>React WebRTC Client</h1>
//       <video ref={localVideoRef} muted></video>
//     </div>
//   );
// }

export default App;