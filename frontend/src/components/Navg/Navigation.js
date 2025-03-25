// src/components/Navigation.js
import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <Navbar style={{ backgroundColor: '#343a40' }} variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
          Grocery Manager
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              style={{ color: '#fff', fontSize: '18px', fontWeight: '500' }}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/add" 
              style={{ color: '#fff', fontSize: '18px', fontWeight: '500' }}
            >
              Add Grocery
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
