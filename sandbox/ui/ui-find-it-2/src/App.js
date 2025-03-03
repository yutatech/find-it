import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Main/Home/Home';
import Page1 from './Main/LearningPhase/Page1';
import Page2 from './Main/InferencePhase/Page2';
import AddPhoto from './Main/LearningPhase/TeacherData/AddPhoto';
import LabelManagement from './Main/LearningPhase/TeacherData/LabelManagement';
import EditPhoto from './Main/LearningPhase/TeacherData/EditPhoto';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/page1" element={<Page1 />} />
      <Route path="/page2" element={<Page2 />} />
      <Route path="/page1/addphoto" element={<AddPhoto />} />
      <Route path="/page1/labelmanagement" element={<LabelManagement />} />
      <Route path="/page1/editphoto" element={<EditPhoto />} />
      </Routes>
    </Router>
  );
}

export default App;
