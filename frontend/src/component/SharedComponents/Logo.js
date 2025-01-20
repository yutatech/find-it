// Logo.js
import React from "react";
import logo from "./logo.png"; // ロゴ画像へのパス

const Logo = () => {
  const logoStyle = {
    zIndex: 100,
    position: "absolute",
    top: "2vh",
    right: "2vw",
    width: "100px", // サイズを調整
  };

  return <img src={logo} alt="Find It Logo" style={logoStyle} />;
};

export default Logo;
