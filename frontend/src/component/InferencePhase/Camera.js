import React, { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';


import ResultView from "./ResultView";
import LabelSelect from "./LabelSelect";
import useResultReceiver from "../../hooks/useResultReceiver";
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
    <>
      <Row className="d-flex w-100 justify-content-start" style={{ zIndex: 2, position: 'absolute', margin: '0'}}>
        <LabelSelect />
      </Row>
      <Row className='d-flex justify-content-center' style={{ zIndex: 1, position: 'absolute', margin: '0'}}>
        <ResultView
          isVideoStreamReady={isStreamReady}
          videoStreamRef={streamRef}
          setOnGetResult={setOnGetResult}
          calcDisplacementFromTime={calcDisplacementFromTime}
          streamStartTimeRef={streamStartTimeRef} />
      </Row>
    </>
  );
}

export default Camera;
