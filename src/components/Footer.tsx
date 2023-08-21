import React from 'react';
import { Twitter } from 'react-bootstrap-icons';


import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


class Footer extends React.Component {
    render() {
        return (
            <Navbar expand="lg" className="bg-body-tertiary mt-10 footer fixed-bottom">
                <Container fluid className='justify-content-md-center'>
                    <Nav>
                        <Nav.Link href="#home">Made by Sergey Potekhin</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        );
    }
}


export default Footer;