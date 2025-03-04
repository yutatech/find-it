import React, { useEffect } from "react";
import { Row, Container } from 'react-bootstrap';


import ResultView from "./ResultView";
import LabelSelect from "./LabelSelect";
import useResultReceiver from "../../hooks/useResultReceiver";
import useOpticalFlow from "../../hooks/useOpticalFlow";

function FindTab({ streamRef, isStreamReady, streamStartTimeRef }) {
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
    <Container className="h-100" style={{ padding: 0, margin: 0 }}>
      <Row className="d-flex w-100 justify-content-start" style={{ zIndex: 2, position: 'absolute', margin: '0' }}>
        <LabelSelect />
      </Row>
      <Row className='d-flex w-100 h-100' style={{ zIndex: 1, padding: 0, margin: 0, position: 'relative', overflow: 'hidden' }}>
        <ResultView
          isVideoStreamReady={isStreamReady}
          videoStreamRef={streamRef}
          setOnGetResult={setOnGetResult}
          calcDisplacementFromTime={calcDisplacementFromTime}
          streamStartTimeRef={streamStartTimeRef} />
      </Row>
    </Container>
  );
}

export default FindTab;
