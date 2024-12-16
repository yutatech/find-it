import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Find-it</h1>
      <button onClick={() => navigate('/page1')}>学習</button>
      <button onClick={() => navigate('/page2')}>探す</button>
    </div>
  );
}

export default Home;
