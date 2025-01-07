import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

import useResultReceiver from "../../hooks/useResultReceiver";
import ResultView from "./ResultView";

function Camera({ streamRef, isStreamReady }) {
  const navigate = useNavigate();
  const location = useLocation();
  const label = location.state?.label;

  const { setupResultReceiver, deleteResultReceiver, setOnGetResult } = useResultReceiver();

  useEffect(() => {
    // ResultDrawerの初期化
    setupResultReceiver();

    return () => {
      deleteResultReceiver();
    };
  }, [isStreamReady]);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate('/page2')}>ラベル選択に戻る</button>
      <h2>選択されたラベル: {label}</h2>
      <ResultView isVideoStreamReady={isStreamReady} videoStreamRef={streamRef} setOnGetResult={setOnGetResult} />
    </div>
  );
}

export default Camera;
