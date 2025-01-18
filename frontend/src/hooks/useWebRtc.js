import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { SocketRefContext } from "../modules/SocketRefContext";

const useWebRtc = (localStreamRef, isLocalStreamReady) => {
  const socketRef = useContext(SocketRefContext);
  const [isConnected, setIsConnected] = useState(false);
  const peerConnection = useRef(null);
  const offerRef = useRef(null);
  const startTimeRef = useRef(null);

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
      setupWebRtc();
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
    if (isLocalStreamReady) {
      setupWebRtc();
    }
  }, [isLocalStreamReady]);

  return { isConnected, setupWebRtc, startTimeRef };
};

export default useWebRtc;