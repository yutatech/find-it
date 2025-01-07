import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

import useResultReceiver from "../../hooks/useResultReceiver";
import useResultDrawer from "../../hooks/useResultDrawer";

function Camera({ streamRef, isStreamReady, videoSize }) {
  const videoRef = useRef(null); // video要素への参照
  const canvasRef = useRef(null); // canvas要素への参照
  const navigate = useNavigate();
  const location = useLocation();
  const label = location.state?.label;

  const { drawResult, clearCanvas, canvasSize } = useResultDrawer(canvasRef, videoSize);
  const { setupResultReceiver } = useResultReceiver(drawResult);

  useEffect(() => {
    videoRef.current.srcObject = streamRef.current;

    // ResultDrawerの初期化
    setupResultReceiver();
  }, [isStreamReady]);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate('/page2')}>ラベル選択に戻る</button>
      <h2>選択されたラベル: {label}</h2>

      <div style={{ position: "relative", width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}>
        {/* Video */}
        <video
          ref={videoRef}
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
    </div>
  );
}

export default Camera;
