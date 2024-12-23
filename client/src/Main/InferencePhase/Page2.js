import React from 'react';
// import { useNavigate } from 'react-router-dom';
import Labelselect from './Labelselect';

function Page2() {
  // const navigate = useNavigate()
  return (
    <div>
      <h1>探す</h1>
      {/* <h2>ラベルの選択</h2> */}
      <Labelselect />
    </div>
  );
}

export default Page2;
