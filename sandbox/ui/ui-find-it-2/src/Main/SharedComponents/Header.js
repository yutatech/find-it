import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header>
    <nav>
      <Link to="/learning">学習フェーズ</Link>
      <Link to="/inference">推論フェーズ</Link>
    </nav>
  </header>
);

export default Header;
