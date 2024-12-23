import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './component/Home/Home';
import Page1 from './component/LearningPhase/Page1';
import Page2 from './component/InferencePhase/Page2';
import AddPhoto from './component/LearningPhase/TeacherData/AddPhoto';
import LabelManagement from './component/LearningPhase/TeacherData/LabelManagement';
import EditPhoto from './component/LearningPhase/TeacherData/EditPhoto';
import Labelselect from './component/InferencePhase/Labelselect';
import Logo from "./component/SharedComponents/Logo";
import Header from './component/SharedComponents/Header';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div style={{ position: "relative", minHeight: "100vh" }}>
        {/* 常に右上に表示されるロゴ */}
        <Header />
        <Logo />
        {/* ルーティング設定 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Labelselect />} />
          <Route path="/page1/addphoto" element={<AddPhoto />} />
          <Route path="/page1/labelmanagement" element={<LabelManagement />} />
          <Route path="/page1/editphoto" element={<EditPhoto />} />
        </Routes>
      </div>
    </Router>

  );
}

export default App;
