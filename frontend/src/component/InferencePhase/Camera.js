import React, { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

import useResultReceiver from "../../hooks/useResultReceiver";
import ResultView from "./ResultView";
import useOpticalFlow from "../../hooks/useOpticalFlow";

function Camera({ streamRef, isStreamReady, streamStartTimeRef }) {
  const navigate = useNavigate();
  const location = useLocation();
  const label = location.state?.label;

  const { calcDisplacementFromTime } = useOpticalFlow(streamRef, isStreamReady);
  const { setupResultReceiver, deleteResultReceiver, setOnGetResult } = useResultReceiver();

  useEffect(() => {
    // ResultDrawerの初期化
    setupResultReceiver();

    return () => {
      deleteResultReceiver();
    };
  }, [isStreamReady]);

  return (
    <div>
      <button onClick={() => navigate('/labelselect')}>ラベル選択に戻る</button>
      <h2>選択されたラベル: {label}</h2>
      <ResultView isVideoStreamReady={isStreamReady} videoStreamRef={streamRef} setOnGetResult={setOnGetResult} calcDisplacementFromTime={calcDisplacementFromTime} streamStartTimeRef={streamStartTimeRef} />
    </div>
  );
}

export default Camera;
