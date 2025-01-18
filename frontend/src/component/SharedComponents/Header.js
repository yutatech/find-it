// component/SharedComponents/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import './HeaderStyle.css';

const Header = () => {
  const navigate = useNavigate();
  const [isFindPhase, setIsFindPhase] = useState(true);

  const onFindButton = () => {
    setIsFindPhase(true);
    navigate('/InferencePhasePage/labelselect');
  };

  const onSettingsButton = () => {
    setIsFindPhase(false);
    navigate('/');
  };

  return (
    <div className='align-self-end' style={{ height: '7vh', width: '100%', position: 'absolute' }}>
      <Row style={{ height: '100%' }}>
        <Col className='d-flex flex-row'>
          <Button onClick={onFindButton}
            variant='primary'
            className='d-flex justify-content-center align-items-center'
            style={{ height: '100%', width: '50%', borderRadius: '0', padding: '0' }}>
            <span className={`${isFindPhase ? 'button-symbol-active' : 'button-symbol-inactive'}
                              material-symbols-outlined`}>
              search
            </span>
            <p className={isFindPhase ? 'p-active' : 'p-inactive'}>探す</p>
          </Button>
          <Button onClick={onSettingsButton}
            variant='primary'
            className='d-flex justify-content-center align-items-center'
            style={{ height: '100%', width: '50%', borderRadius: '0', padding: '0' }}>
            <span className={`${!isFindPhase ? 'button-symbol-active' : 'button-symbol-inactive'}
                              material-symbols-outlined`}>
              settings
            </span>
            <p className={!isFindPhase ? 'p-active' : 'p-inactive'}>設定</p>
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Header;