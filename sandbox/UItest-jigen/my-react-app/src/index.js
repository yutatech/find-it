import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Appsample1 from './Appsample1';
import AutoComplete from './AutoComplete';
import Labelselect from './Labelselect';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> 
    {/* <Appsample1 /> */}
    {/* <Labelselect /> */}
  </React.StrictMode>
);
