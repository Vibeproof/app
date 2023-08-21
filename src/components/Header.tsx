import React from 'react';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavLink from 'react-bootstrap/NavLink';


import { Link } from 'react-router-dom';
import { ConnectKitButton } from "connectkit";


import 'bootstrap/dist/css/bootstrap.min.css';


function Header() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary justify-content-between" sticky='top'>
      <Container>
          <Link to={'/'} style={{ textDecoration: 'none' }}>
            <Navbar.Brand>Snaphost</Navbar.Brand>
          </Link>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                  <Link to={'/my/tickets'} className='nav-link' style={{ textDecoration: 'none' }}>
                    My events
                  </Link>

                  <Link to={'/my/events'} className='nav-link' style={{ textDecoration: 'none' }}>
                    My events
                  </Link>

                  <Link to={'/event/create'} className='nav-link' style={{ textDecoration: 'none' }}>
                    Create an event
                  </Link>
              </Nav>
          </Navbar.Collapse>

          <ConnectKitButton showAvatar={true} theme='soft'/>
      </Container>
    </Navbar>
  );  
}


export default Header;