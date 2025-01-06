import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './component/Home/Home';
import Page1 from './component/LearningPhase/Page1';
import Page2 from './component/InferencePhase/Page2';
import AddPhoto from './component/LearningPhase/TeacherData/AddPhoto';
import LabelManagement from './component/LearningPhase/TeacherData/LabelManagement';
import EditPhoto from './component/LearningPhase/TeacherData/EditPhoto';
import Labelselect from './component/InferencePhase/Labelselect';
import Camera2 from './component/InferencePhase/Camera2';
import Logo from "./component/SharedComponents/Logo";
import Header from './component/SharedComponents/Header';
import 'bootstrap/dist/css/bootstrap.min.css';

import { SocketRefProvider } from './modules/SocketRefContext';
import useLocalVideo from './hooks/useLocalVideo';

function App() {
  const { localStreamRef, isLocalStreamReady, videoSize } = useLocalVideo();

  return (
    <Router>
      <div style={{ position: "relative", minHeight: "100vh" }}>
        {/* 常に右上に表示されるロゴ */}
        <Header />
        <Logo />
        {/* Socket通信のインスタンスを全体で共有 */}
        <SocketRefProvider>
          {/* ルーティング設定 */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/page1" element={<Page1 />} />
            <Route path="/page2" element={<Labelselect />} />
            <Route path="/page2/camera" element={<Camera2 streamRef={localStreamRef} isStreamReady={isLocalStreamReady} canvasSize={videoSize}/>} />
            <Route path="/page1/addphoto" element={<AddPhoto />} />
            <Route path="/page1/labelmanagement" element={<LabelManagement />} />
            <Route path="/page1/editphoto" element={<EditPhoto />} />
          </Routes>
        </SocketRefProvider>
      </div>
    </Router>

  );
}

export default App;
