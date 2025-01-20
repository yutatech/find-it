import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LearningPhasePage from './component/LearningPhase/LearningPhasePage';
import AddPhoto from './component/LearningPhase/TeacherData/AddPhoto';
import LabelManagement from './component/LearningPhase/TeacherData/LabelManagement';
import EditPhoto from './component/LearningPhase/TeacherData/EditPhoto';
import Labelselect from './component/InferencePhase/LabelSelect';
import Camera from './component/InferencePhase/Camera';
import Logo from "./component/SharedComponents/Logo";
import Header from './component/SharedComponents/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from "react-bootstrap";

import { SocketRefProvider } from './modules/SocketRefContext';
import useLocalVideo from './hooks/useLocalVideo';
import useWebRtc from './hooks/useWebRtc';
import { useState, useEffect } from 'react';


function Component() {
  const { localStreamRef, isLocalStreamReady } = useLocalVideo();
  const { startTimeRef } = useWebRtc(localStreamRef, isLocalStreamReady);
  const [windowHeight, setWindowHeight] = useState(0);
  const [viewHight, setViewHight] = useState(0);

  useEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight);  // 現在のウィンドウ高さを設定
      const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize); // 1remのピクセル値
      setViewHight(window.innerHeight - 4 * remSize);  // 現在のウィンドウ高さからヘッダーの高さを引いたものを設定
    };

    // 初回実行
    updateWindowHeight();

    // ウィンドウのリサイズ時にも高さを更新
    window.addEventListener('resize', updateWindowHeight);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', updateWindowHeight);
    };
  }, []);

  return (
    <Router>
      <div className="d-flex justify-content-center">
        <Container fluid="xl" className="d-flex flex-column" style={{ height: `${windowHeight}`, padding: '0px', position: 'relative' }}>
          {/* 常に右上に表示されるロゴ */}
          <Logo />
          <Row className="d-flex w-100 flex-column flex-grow-1 " style={{ padding: 0, margin: 0, height: `${viewHight}px` }}>
            {/* ルーティング設定 */}
            <Routes>
              <Route path="/" element={<Camera streamRef={localStreamRef} isStreamReady={isLocalStreamReady} streamStartTimeRef={startTimeRef} />} />
              <Route path="/LearningPhasePage" element={<LearningPhasePage />} />
              {/* <Route path="/InferencePhasePage/labelselect" element={<Labelselect />} />
              <Route path="/InferencePhasePage/camera" element={<Camera streamRef={localStreamRef} isStreamReady={isLocalStreamReady} streamStartTimeRef={startTimeRef} />} /> */}
              {/* <Route path="/LearningPhasePage/addphoto" element={<AddPhoto />} />
              <Route path="/LearningPhasePage/labelmanagement" element={<LabelManagement />} />
              <Route path="/LearningPhasePage/editphoto" element={<EditPhoto />} /> */}
            </Routes>
          </Row>
          <Header />
        </Container>
      </div>
    </Router>
  );
}

function App() {
  return (
    <>
      {/* Socket通信のインスタンスを全体で共有 */}
      <SocketRefProvider>
        <Component />
      </SocketRefProvider>
    </>
  );
}

export default App;
