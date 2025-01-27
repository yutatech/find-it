import React from 'react';
import { Container, Row } from 'react-bootstrap';

import AddPhoto from './Cols/AddPhoto';
import LabelManagement from './Cols/LabelManagement';
import EditPhoto from './Cols/EditPhoto';

import './ButtonStyle.css';

function SettingsTab() {
  return (
    <Container fluid="md" className='d-flex h-100 flex-column' style={{ padding: 0, margin: 0 }}>
      <Row className='d-flex w-100' style={{ margin: 0, paddingTop: '1rem', backgroundColor: 'lightgray' }}>
        <h1>設定</h1>
      </Row>
      <Row className='d-flex w-100' style={{ margin: 0, overflow: 'hidden'}}>
        <Container fluid="md" className="justify-content-center flex-column"
          style={{ margin: 0, maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          <Row className="align-items-start">
            <AddPhoto />
            <LabelManagement />
            <EditPhoto />
          </Row>
        </Container>
      </Row>
    </Container>
  );
}

export default SettingsTab;
