import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import { Fetch, WebSocket } from "engine.io-client";

const server_url = "https://yuta-air.local:8000";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStreamRef = useRef(null);

  useEffect(() => {
    // StartWebRTC();
  });

  async function StartWebRTC() {
    try {
      // カメラの取得
      document.getElementById('log').innerText = 'waiting';
      await navigator.mediaDevices.getUserMedia({ video: { width: 360, height: 240, facingMode: 'user' }, audio: false })
        .then((stream) => {
          localStream.current = stream;

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

    // try {
    console.log('on connection create');
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // ローカルのストリームをWebRTC接続に追加
    localStream.current.getTracks().forEach((track) => {
      const sender = peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.oniceconnectionstatechange = (event) => {
      console.log('oniceconnectionstatechange:', event);
    };
    peerConnection.current.onsignalingstatechange = (event) => {
      console.log('onsignalingstatechange:', event);
    };

    // ICE Candidateの処理
    peerConnection.current.onicecandidate = (event) => {
      console.log('onicecandidate');
      if (event.candidate) {
        console.log('Sending ICE candidate to other peer:', event.candidate);
        fetch(`${server_url}/ice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate: event.candidate,
          })
        })
          .then(response => response.json())
          .catch(err => {
            console.error('Error starting connection.', err);
          });
      }
    };

    // オファーを作成
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    console.log('Sending offer:', offer);
    fetch(`${server_url}/offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offer: offer,
      })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Received answer:', data.answer);
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));

        document.getElementById('localVideo').srcObject = localStream.current;
      })
      .catch((err) => {
        console.error('Error starting connection.', err);
      });
    // }
    // catch (err) {
    //   console.error('Error creating offer.', err);
    // }
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
