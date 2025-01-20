// component/SharedComponents/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './HeaderStyle.css';

const Header = () => {
  const navigate = useNavigate();
  const [isFindPhase, setIsFindPhase] = useState(true);

  const onFindButton = () => {
    setIsFindPhase(true);
    navigate('/');
  };

  const onSettingsButton = () => {
    setIsFindPhase(false);
    navigate('/LearningPhasePage');
  };

  return (
    <Row style={{ height: '4rem', width:'100%', padding: '0', margin: '0', zIndex: '100' }}>
      <Button onClick={onFindButton}
        variant='primary'
        className='d-flex justify-content-center align-items-center h-100 w-50'
        style={{ borderRadius: '0', padding: '0' }}>
        <span className={`${isFindPhase ? 'button-symbol-active' : 'button-symbol-inactive'}
                          material-symbols-outlined`}>
          search
        </span>
        <p className={isFindPhase ? 'p-active' : 'p-inactive'}>探す</p>
      </Button>
      <Button onClick={onSettingsButton}
        variant='primary'
        className='d-flex justify-content-center align-items-center h-100 w-50'
        style={{ borderRadius: '0', padding: '0' }}>
        <span className={`${!isFindPhase ? 'button-symbol-active' : 'button-symbol-inactive'}
                          material-symbols-outlined`}>
          settings
        </span>
        <p className={!isFindPhase ? 'p-active' : 'p-inactive'}>設定</p>
      </Button>
    </Row>
  );
};

export default Header;