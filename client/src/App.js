import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './component/Home/Home';
import Page1 from './component/LearningPhase/Page1';
import Page2 from './component/InferencePhase/Page2';
import AddPhoto from './component/LearningPhase/TeacherData/AddPhoto';
import LabelManagement from './component/LearningPhase/TeacherData/LabelManagement';
import EditPhoto from './component/LearningPhase/TeacherData/EditPhoto';
import Labelselect from './component/InferencePhase/Labelselect';

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
      <Route path="/page2/labelselect" element={<Labelselect />} />     
      </Routes>
    </Router>
  );
}

export default App;
