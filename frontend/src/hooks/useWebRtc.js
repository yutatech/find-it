import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { SocketRefContext } from "../modules/SocketRefContext";

const useWebRtc = (localStreamRef, isLocalStreamReady) => {
  const {socketRef, isSocketReady} = useContext(SocketRefContext);
  const [isConnected, setIsConnected] = useState(false);
  const peerConnection = useRef(null);
  const offerRef = useRef(null);
  const startTimeRef = useRef(null);

  const handleAnswer = async (answer) => {
    await peerConnection.current.setLocalDescription(offerRef.current);
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const setSocketHandlers = () => {
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setupWebRtc();
    });

    socketRef.current.on('answer', (data) => {
      console.log('Received answer:', data);
      handleAnswer(data);
    });
  };

  const createPeerConnection = async () => {
    // PeerConnectionの作成
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    peerConnection.current.oniceconnectionstatechange = (event) => {
      console.log('ICE connection state change:', event.target.iceConnectionState);
    };
    peerConnection.current.onsignalingstatechange = (event) => {
      console.log('Signaling state change:', event.target.signalingState);
    };
    peerConnection.current.onconnectionstatechange = (event) => {
      console.log('Connection state change:', event.target.connectionState);
      if (event.target.connectionState === 'connected') {
        setIsConnected(true);
      }
      else if (event.target.connectionState === 'disconnected') {
        setIsConnected(false);
      }
    };
    peerConnection.current.onicegatheringstatechange = (event) => {
      console.log('ICEgathering state change:', event.target.iceGatheringState);
    };

    // LocalのTrackをWebRTC接続に追加
    await localStreamRef.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStreamRef.current);

      // 定期的に getStats() を呼び出して監視
      const interval = setInterval(async () => {
        const stats = await peerConnection.current.getStats(null);
        stats.forEach(report => {
          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            if (report.framesEncoded > 0 && !startTimeRef.current) {
              // 最初のフレームが送信された時のシステム時刻を取得
              startTimeRef.current = new Date();
              // 監視を終了
              clearInterval(interval);
            }
          }
        });
      }, 10); // 10msごとに監視
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
    if (isLocalStreamReady, isSocketReady) {
      setupWebRtc();
    }
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    }
  }, [isLocalStreamReady, isSocketReady]);

  return { isConnected, setupWebRtc, startTimeRef };
};

export default useWebRtc;