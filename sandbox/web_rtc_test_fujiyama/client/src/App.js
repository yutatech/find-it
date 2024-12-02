import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const server_url = "http://yuta-air.local:8000";

const socket = io(server_url); // FastAPIサーバーのURL

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const socketRef = useRef(null);

  // クライアントがWebSocketでサーバーに接続する際の設定
  useEffect(() => {
    // Socket.IOサーバーへの接続
    socketRef.current = io(server_url); // サーバーのURL

    socketRef.current.on('connect', () => {
      console.log('Connected to the signaling server');
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
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
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
    await peerConnectionRef.current.setLocalDescription(offer);

    // サーバーにオファーを送信
    socketRef.current.emit('offer', {
      type: offer.type,
      sdp: offer.sdp,
    });
    setIsConnected(true);
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