import React from 'react';
import { useNavigate } from 'react-router-dom';

function Page1() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>学習</h1>
      <button onClick={() => navigate('/page1/addphoto')}>写真を追加</button>
      <button onClick={() => navigate('/page1/editphoto')}>写真を編集</button>
      <button onClick={() => navigate('/')}>ラベルを追加</button>
      <button onClick={() => navigate('/page1/labelmanagement')}>ラベルを編集</button>
      <button onClick={() => navigate('/')}>Homeに戻る</button>
    </div>
  );
}

export default Page1;
