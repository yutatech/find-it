// Logo.js
import React from "react";
import logo from "./logo.png"; // ロゴ画像へのパス

const Logo = () => {
  const logoStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "100px", // サイズを調整
  };

  return <img src={logo} alt="Find It Logo" style={logoStyle} />;
};

export default Logo;
