import React from 'react';
import logo from './logo.png'; // logo.pngのパスに合わせて調整
import './../../App.css'; // CSSファイルをインポート

const Logo = () => {
  const logoStyle = {
    zIndex: 100,
    position: "absolute",
    top: "0.5vh",
    right: "2vw",
    height: "3.8rem", // サイズを調整
  };

  return <img src={logo} alt="Find It Logo" style={logoStyle} />;
};

export default Logo;

