import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LearningPhasePage from './component/LearningPhase/LearningPhasePage';
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
            <Route path="/LearningPhasePage" element={<LearningPhasePage />} />
            <Route path="/InferencePhasePage/Labelselect" element={<Labelselect />} />
            <Route path="/InferencePhasePage/camera" element={<Camera2 streamRef={localStreamRef} isStreamReady={isLocalStreamReady} canvasSize={videoSize}/>} />
            <Route path="/LearningPhasePage/addphoto" element={<AddPhoto />} />
            <Route path="/LearningPhasePage/labelmanagement" element={<LabelManagement />} />
            <Route path="/LearningPhasePage/editphoto" element={<EditPhoto />} />
          </Routes>
        </SocketRefProvider>
      </div>
    </Router>

  );
}

export default App;
