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
    StartWebRTC();
  });

  async function StartWebRTC() {
    try {
      // カメラの取得
      document.getElementById('log').innerText = 'waiting';
      await navigator.mediaDevices.getUserMedia({ video: { width: 360, height: 240, facingMode: 'user' }, audio: false })
        .then((stream) => {
          localStream.current = stream;

          localStream.current.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, localStream.current);
          });
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

    try {
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      // ICE Candidateの処理
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate to other peer:', event.candidate);
          socketRef.current.emit('ice_candidate', event.candidate);
        }
      };

      // オファーを作成
      const offer = await peerConnectionRef.current.createOffer();
      fetch(`${server_url}/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer: offer,
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Received answer:', data.answer);
          peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));

        })
        .catch(err => {
          console.error('Error starting connection.', err);
        });
    }
    catch (err) {
      console.error('Error creating offer.', err);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
