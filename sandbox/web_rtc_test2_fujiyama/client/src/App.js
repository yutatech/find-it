import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const server_url = "https://yuta-air.local:8000";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const socket = useRef(null);
  const offer = useRef(null);

  useEffect(() => {
    // StartWebRTC();
  });

  async function StartWebRTC() {
    try {
      // カメラの取得
      await navigator.mediaDevices.getUserMedia({ video: { width: 360, height: 240, facingMode: 'user' }, audio: false })
        .then((stream) => {
          localStream.current = stream;
        })
        .catch((error) => {
          console.error('メディアデバイスの取得エラー:', error);
        });
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }

    try {
      // socket通信の確立
      socket.current = await io(server_url, {
        transports: ['websocket', 'polling']
      });

      socket.current.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.current.on('answer', (data) => {
        handleAnswer(data);
      });

      socket.current.on('ice', (data) => {
        handleIce(data);
      });
    }
    catch (err) {
      console.error('Error creating socket connection.', err);
    }

    try {
      // PeerConnectionの作成
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      // ICE Candidateの送信
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit('ice_candidate', event.candidate);
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
      };

      peerConnection.current.ontrack = (event) => {
        remoteStream.current = event.streams[0];
      };

      // LocalのTrackをWebRTC接続に追加
      await localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });

      // Offerを作成
      offer.current = await peerConnection.current.createOffer();
      socket.current.emit('offer', {
        type: offer.current.type,
        sdp: offer.current.sdp,
      });
    } catch (err) {
      console.error('Error creating peer connection.', err);
    }
  }

  async function handleAnswer(answer) {
    await peerConnection.current.setLocalDescription(offer.current);
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));

    document.getElementById('localVideo').srcObject = localStream.current;
  }

  async function handleIce(ice) {
    console.log('Adding ICE candidate:', ice);
    await peerConnection.current.addIceCandidate(new RTCIceCandidate(ice.candidate));
  }

  return (
    <div className="App">
      <h1>WebRTC Video Call</h1>
      <video id="localVideo" autoPlay muted width="300" height="200" />
      <div id="log">test</div>
      <div>
        {isConnected ? (
          <p>Connected</p>
        ) : (
          <button onClick={StartWebRTC}>Start Call</button>
        )}
      </div>
    </div>
  );
}

export default App;
