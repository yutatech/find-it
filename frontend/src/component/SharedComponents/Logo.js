import React from 'react';
import logo from './logo.png'; // logo.pngのパスに合わせて調整
import './LogoStyle.css';


const Logo = () => {
  return <img src={logo} alt="Find It Logo" className='logo' />;
};

export default Logo;

