import React from 'react';
import { useNavigate } from 'react-router-dom';

function LearningPhasePage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>学習</h1>
      <button onClick={() => navigate('/LearningPhasePage/addphoto')}>写真を追加</button>
      <button onClick={() => navigate('/LearningPhasePage/editphoto')}>写真を編集</button>
      <button onClick={() => navigate('/LearningPhasePage/labelmanagement')}>ラベルを編集</button>
    </div>
  );
}

export default LearningPhasePage;
