import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ButtonStyle.css';  // カスタムCSSをインポート

function LearningPhasePage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>学習</h1>
      <button className="add-photo-button" onClick={() => navigate('/learningphasepage/addphoto')}>写真を追加</button>
      <button className="add-photo-button" onClick={() => navigate('/learningphasepage/editphoto')}>写真を編集</button>
      <button className="add-photo-button" onClick={() => navigate('/learningphasepage/labelmanagement')}>ラベルを編集</button>
    </div>
  );
}

export default LearningPhasePage;
