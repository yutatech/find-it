// component/SharedComponents/Header.js
import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";

const Header = () => (
  <Navbar bg="light" variant="primary" expand="lg">
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ml-auto">
        <Nav.Link as={Link} to="/learningphasepage">学習フェーズ</Nav.Link>
        <Nav.Link as={Link} to="/inferencephasepage/labelselect">推論フェーズ</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default Header;
