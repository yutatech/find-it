import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const server_url = "https://yuta-air.local:8000";

const useWebRtc = (socketRef, localStreamRef, isLocalStreamReady, rocalVideoRef) => {
  const [isConnected, setIsConnected] = useState(false);
  const peerConnection = useRef(null);
  const offerRef = useRef(null);

  const handleAnswer = async (answer) => {
    await peerConnection.current.setLocalDescription(offerRef.current);
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIce = async (ice) => {
    console.log('Adding ICE candidate:', ice);
    await peerConnection.current.addIceCandidate(new RTCIceCandidate(ice.candidate));
  };

  const setSocketHandlers = () => {
    console.log('setSocketHandlers2');
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketRef.current.on('answer', (data) => {
      console.log('Received answer:', data);
      handleAnswer(data);
    });

    socketRef.current.on('ice', (data) => {
      handleIce(data);
    });
  };

  const createPeerConnection = async () => {
    // PeerConnectionの作成
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // ICE Candidateの送信
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice_candidate', event.candidate);
      }
    };

    peerConnection.current.oniceconnectionstatechange = (event) => {
      console.log('oniceconnectionstatechange:', event);
    };
    peerConnection.current.onsignalingstatechange = (event) => {
      console.log('onsignalingstatechange:', event);
    };
    peerConnection.current.onconnectionstatechange = (event) => {
      console.log('onconnectionstatechange:', event);
      if (event.target.connectionState === 'connected') {
        setIsConnected(true);
      }
      else if (event.target.connectionState === 'disconnected') {
        setIsConnected(false);
      }
    };

    // LocalのTrackをWebRTC接続に追加
    await localStreamRef.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStreamRef.current);
    });

    // Offerを作成
    offerRef.current = await peerConnection.current.createOffer();
    console.log('Offer created:', offerRef.current);
    await socketRef.current.emit('offer', {
      type: offerRef.current.type,
      sdp: offerRef.current.sdp,
    });
  };

  const setupWebRtc = async () => {
    if (isLocalStreamReady) {
      console.log('localStreamRef:', localStreamRef.current);
      await setSocketHandlers();
      await createPeerConnection();
    }
  };

  useEffect(() => {
    if (isConnected) {
      rocalVideoRef.current.srcObject = localStreamRef.current;
    }
    else {
      rocalVideoRef.current.srcObject = null;
    }
  }, [isConnected]);

  return { isConnected, setupWebRtc };
};

const useLocalVideo = () => {
  const localStreamRef = useRef(null);
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false);

  const getLocalStream = async () => {
    // カメラの取得
    navigator.mediaDevices.getUserMedia({ video: { width: 360, height: 240, facingMode: 'user' }, audio: false })
      .then((stream) => {
        console.log('success to get media');
        localStreamRef.current = stream;
        setIsLocalStreamReady(true);
      })
      .catch((error) => {
        console.error('メディアデバイスの取得エラー:', error);
      });
  };

  return { localStreamRef, isLocalStreamReady, getLocalStream };
};

const useResultReceiver = (socketRef, drawResult) => {
  const handleResult = (result) => {
    drawResult(result);
  };

  const setSocketHandlers = () => {
    console.log('setSocketHandlers');
    socketRef.current.on("result", (result) => {
      handleResult(result);
    });
  };

  const setupResultReceiver = () => {
    setSocketHandlers();
  }

  return { setupResultReceiver };
};

const useResultDrawer = (canvasRef) => {
  const drawResult = (result) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // console.log('result:', result);
    result.results.forEach((result) => {
      if (result.label === 'person') {
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      }
      else {
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
      }

      ctx.fillRect(result.box[0], result.box[1], result.box[2], result.box[3]);
    });
  }

  return { drawResult };
};


function App() {
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null);
  socketRef.current = io(server_url, {
    transports: ['websocket', 'polling']
  });
  const { localStreamRef, isLocalStreamReady, getLocalStream } = useLocalVideo();
  const { isConnected, setupWebRtc } = useWebRtc(socketRef, localStreamRef, isLocalStreamReady, localVideoRef);
  const { drawResult } = useResultDrawer(canvasRef);
  const { setupResultReceiver } = useResultReceiver(socketRef, drawResult);

  const setupConnection = () => {
    setupWebRtc();
    setupResultReceiver();
  };

  useEffect(() => {
    getLocalStream();
  });

  return (
    <div className="App">
      <h1>WebRTC Video Call</h1>
      <div style={{ position: "relative", width: "300px", height: "200px" }}>
        {/* Video */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          width="300"
          height="200"
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width="300"
          height="200"
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        />
      </div>
      <div>
        {isConnected ? (
          <p>Connected</p>
        ) : (
          <button onClick={setupConnection}>Start Call</button>
        )}
      </div>
    </div>
  );
}

export default App;
