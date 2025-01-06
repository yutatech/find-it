import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import cv from '@techstark/opencv-js';
window.cv = cv;

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

const useResultDrawer = (canvasRef, videoSize) => {
  const [canvasSize, setCanvasSize] = useState({ width: videoSize.width, height: videoSize.height });
  const drawResult = (result) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const imageSize = { width: result.image_size.width, height: result.image_size.height };

    const scale = canvas.width / videoSize.width;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // キャンバスをクリア
    ctx.clearRect(0, 0, videoSize.width, videoSize.height);

    const imgTocanvasScale = videoSize.width / imageSize.width;
    // console.log('result:', result);
    result.results.forEach((result) => {
      result.box[0] *= imgTocanvasScale;
      result.box[1] *= imgTocanvasScale;
      result.box[2] *= imgTocanvasScale;
      result.box[3] *= imgTocanvasScale;

      let fillStyle = "";
      let textStyle = "";
      if (result.label === 'person') {
        fillStyle = "rgba(255, 0, 0, 0.5)";
        textStyle = "rgba(255, 0, 0, 1)";
      }
      else {
        fillStyle = "rgba(0, 255, 0, 0.5)";
        textStyle = "rgba(0, 255, 0, 1)";
      }
      ctx.fillStyle = fillStyle;
      ctx.fillRect(result.box[0], result.box[1], result.box[2], result.box[3]);
      ctx.fillStyle = textStyle;
      ctx.font = "15px Arial";
      ctx.fillText(result.label, result.box[0], result.box[1] + 15);
      ctx.strokeRect(10, 10, videoSize.width - 20, videoSize.height - 20);
    });
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, videoSize.width, videoSize.height);
  };

  const handleCanvasResize = () => {
    let width = videoSize.width;
    let height = videoSize.height;

    if (width > window.innerWidth) {
      height = window.innerWidth * height / width;
      width = window.innerWidth;
    }
    if (height > window.innerHeight) {
      width = window.innerHeight * width / height;
      height = window.innerHeight;
    }

    setCanvasSize({ width: width, height: height });
  };

  useEffect(() => {
    console.log('canvasSize:', canvasSize.width, canvasSize.height);
  }, [canvasSize]);


  useEffect(() => {
    handleCanvasResize();
  }, [videoSize]);


  useEffect(() => {
    // リスナーを登録
    window.addEventListener("resize", handleCanvasResize);

    // クリーンアップ: リスナーを削除
    return () => {
      window.removeEventListener("resize", handleCanvasResize);
    };
  }, []);

  return { drawResult, clearCanvas, canvasSize };
};

// const VideoMotionDetector = (streamRef, isLocalStreamReady) => {
//   const canvasRef = useRef(null);
//   const prevFrameRef = useRef(null);

//   useEffect(() => {
//       if (!streamRef.current) return;
//       const videoTrack = streamRef.current.getVideoTracks()[0]

//       // Create a video element for the video track
//       const video = document.createElement("videoTrack");
//       video.srcObject = new MediaStream([videoTrack]);
//       video.play();

//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       const processFrame = () => {
//           // Draw the current frame on the canvas
//           ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//           // Get the current frame data
//           const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

//           if (prevFrameRef.current) {
//               // Compare the current frame with the previous frame
//               const movement = calculateMovement(prevFrameRef.current, currentFrame);
//               console.log("Movement detected:", movement);
//           }

//           // Save the current frame as the previous frame for the next iteration
//           prevFrameRef.current = currentFrame;

//           // Process the next frame
//           requestAnimationFrame(processFrame);
//       };

//       // Start processing frames
//       processFrame();

//       // Cleanup on unmount
//       return () => {
//           video.pause();
//       };
//   }, [isLocalStreamReady]);

//   const calculateMovement = (prevFrame, currentFrame) => {
//       let totalDiff = 0;
//       const threshold = 20; // Sensitivity for motion detection

//       // Loop through each pixel (4 values per pixel: r, g, b, a)
//       for (let i = 0; i < prevFrame.data.length; i += 4) {
//           const rDiff = Math.abs(currentFrame.data[i] - prevFrame.data[i]);
//           const gDiff = Math.abs(currentFrame.data[i + 1] - prevFrame.data[i + 1]);
//           const bDiff = Math.abs(currentFrame.data[i + 2] - prevFrame.data[i + 2]);

//           if (rDiff > threshold || gDiff > threshold || bDiff > threshold) {
//               totalDiff++;
//           }
//       }

//       // Return the total number of pixels that changed
//       return totalDiff / (currentFrame.data.length / 4);
//   };

//   return (
//       <div>
//           <canvas
//               ref={canvasRef}
//               width={640} // Adjust the resolution to match the video track
//               height={480}
//               style={{ display: "none" }} // Hide canvas if it's not needed visually
//           ></canvas>
//       </div>
//   );
// };


/*
import React, { useEffect, useRef, useState } from 'react';

const VideoProcessor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [processedStream, setProcessedStream] = useState(null);
  const streamRef = useRef(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const processedVideoRef = useRef(null);

  const processVideo = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawFrame = () => {
      if (!video.paused && !video.ended) {
        // 動画をキャンバスに描画
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 画像加工（例: グレースケール化）
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg; // Red
          data[i + 1] = avg; // Green
          data[i + 2] = avg; // Blue
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // 次のフレームを予約
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  };

  useEffect(() => {
    // カメラストリームを取得
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        setIsStreamReady(true);
      })
      .catch((err) => {
        console.error('Error accessing media devices:', err);
      });
  }, []);

  useEffect(() => {
    if (isStreamReady) {
      let video = videoRef.current;
      let canvas = canvasRef.current;
        // ストリームを <video> に設定
        console.log("video", video.srcObject);
        video.srcObject = streamRef.current;
        video.play();

        // キャンバスサイズを動画のサイズに合わせる
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // 動画のフレーム加工を開始
          processVideo();

          // 新しいストリームを生成
          const newStream = canvas.captureStream(30); // 30fps のストリーム
          // setProcessedStream(newStream);
          processedVideoRef.current.srcObject = newStream;
        };
    }
  }, [isStreamReady]);

  return (
    <div>
      <h2>Original Video Stream</h2>
      <video ref={videoRef} autoPlay muted />
      <h2>Processed Video Stream</h2>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        <video ref={processedVideoRef}
          autoPlay
          muted
          style={{ border: '2px solid red' }}
        ></video>
    </div>
  );
};

export default VideoProcessor;
*/


function Communication() {
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoCanvasRef = useRef(null);

  socketRef.current = io(server_url, {
    transports: ['websocket', 'polling']
  });
  const { localStreamRef, isLocalStreamReady, videoSize } = useLocalVideo();
  const { isConnected, setupWebRtc } = useWebRtc(socketRef, localStreamRef, isLocalStreamReady, localVideoRef);
  const { drawResult, clearCanvas, canvasSize } = useResultDrawer(canvasRef, videoSize);
  const { setupResultReceiver } = useResultReceiver(socketRef, drawResult);

  const setupConnection = () => {
    setupWebRtc();
    setupResultReceiver();
  };

  useEffect(() => {
    if (!isConnected) {
      clearCanvas();
    }
  }, [isConnected]);

  return (
    <div className="App">
      <h1>WebRTC Video Call</h1>
      <div ref={videoCanvasRef} style={{ position: "relative", width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}>
        {/* Video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
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
      {/* {VideoProcessor(localStreamRef, isLocalStreamReady)} */}
    </div>
  );
}

export default Communication;