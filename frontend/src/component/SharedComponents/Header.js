// component/SharedComponents/Header.js
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Row, Col, Button } from "react-bootstrap";

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
    <div className="align-self-end" style={{ backgroundColor:'green', height: '7vh', width: '100%', position: 'absolute'}}>
      <Row style={{ height: '100%' }}>
        <Col className="d-flex flex-row">
          <Button onClick={onFindButton}
                  variant="primary"
                  className="d-flex justify-content-center align-items-center"
                  style={{height: '100%', width: '50%', borderRadius: '0', padding: '0'}}>
            <span className="material-symbols-outlined"
                  style={{ 
                    fontSize: '2rem',
                    fontVariationSettings: isFindPhase ? "'GRAD' 200" : "'GRAD' 0"
            }}>search</span>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: isFindPhase ? 'bolder' : 'normal',
              margin: '0',
              marginLeft: '0.5rem'
            }}>探す</p>
          </Button>
          <Button onClick={onSettingsButton}
                  variant="primary"
                  className="d-flex justify-content-center align-items-center"
                  style={{height: '100%', width: '50%', borderRadius: '0', padding: '0'}}>
            <span className="material-symbols-outlined" 
                      style={{ 
                        fontSize: '2rem',
                        fontVariationSettings: !isFindPhase ? "'FILL' 1" : "'FILL' 0"
                  }}>settings</span>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: !isFindPhase ? 'bolder' : 'normal',
              margin: '0',
              marginLeft: '0.5rem'
            }}>設定</p>
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Header;