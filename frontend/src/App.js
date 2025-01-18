import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LearningPhasePage from './component/LearningPhase/LearningPhasePage';
import AddPhoto from './component/LearningPhase/TeacherData/AddPhoto';
import LabelManagement from './component/LearningPhase/TeacherData/LabelManagement';
import EditPhoto from './component/LearningPhase/TeacherData/EditPhoto';
import Labelselect from './component/InferencePhase/Labelselect';
import Camera from './component/InferencePhase/Camera';
import Logo from "./component/SharedComponents/Logo";
import Header from './component/SharedComponents/Header';
import 'bootstrap/dist/css/bootstrap.min.css';

import { SocketRefProvider } from './modules/SocketRefContext';
import useLocalVideo from './hooks/useLocalVideo';
import useWebRtc from './hooks/useWebRtc';


function Component() {
  const { localStreamRef, isLocalStreamReady } = useLocalVideo();
  const { isConnected, setupWebRtc, startTimeRef } = useWebRtc(localStreamRef, isLocalStreamReady);

  return (
    <Router>
      <div style={{ position: "relative", minHeight: "100vh" }}>
        {/* 常に右上に表示されるロゴ */}
        <Header /> 
        <Logo />
          {/* ルーティング設定 */}
          <Routes>
            <Route path="/" element={<LearningPhasePage />} />
            <Route path="/LearningPhasePage" element={<LearningPhasePage />} />
            <Route path="/InferencePhasePage/labelselect" element={<Labelselect />} />
            <Route path="/InferencePhasePage/camera" element={<Camera streamRef={localStreamRef} isStreamReady={isLocalStreamReady} streamStartTimeRef={startTimeRef}/>} />
            <Route path="/LearningPhasePage/addphoto" element={<AddPhoto />} />
            <Route path="/LearningPhasePage/labelmanagement" element={<LabelManagement />} />
            <Route path="/LearningPhasePage/editphoto" element={<EditPhoto />} />
          </Routes>
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
