import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ButtonStyle.css';  // カスタムCSSをインポート
import { Row } from 'react-bootstrap';

function LearningPhasePage() {
  const navigate = useNavigate()

  return (
    <Row className="d-flex w-100 flex-grow-1 justify-content-center">
      <h1>学習</h1>
      <button className="add-photo-button" onClick={() => navigate('/learningphasepage/addphoto')}>写真を追加</button>
      <button className="add-photo-button" onClick={() => navigate('/learningphasepage/editphoto')}>写真を編集</button>
      <button className="add-photo-button" onClick={() => navigate('/learningphasepage/labelmanagement')}>ラベルを編集</button>
    </Row>
  );
}

export default LearningPhasePage;
