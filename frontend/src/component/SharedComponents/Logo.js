import React from 'react';
import logo from './logo.png'; // logo.pngのパスに合わせて調整
import './../../App.css'; // CSSファイルをインポート

function Logo() {
  return (
    <img src={logo} alt="Logo" className="logo" />
  );
}

export default Logo;

