import React, { useEffect } from 'react';
import { useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { SismoConnectConfig, SismoConnectButton, AuthType, SismoConnectResponse } from "@sismo-core/sismo-connect-react";

import { Stepper, Step } from 'react-form-stepper';

import { WagmiConfig, createConfig } from 'wagmi'
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

import {wagmiConfig} from "../config";
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';

import { BoxArrowUpRight } from 'react-bootstrap-icons';

import {
    BrowserRouter as Router,
    Routes,
    Route,
  } from "react-router-dom";
  

import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './Header';
import Footer from './Footer';
import EventList from './EventList';
import EventPage from './EventPage';
import EventCreationPage from './event-creation/Page';


function App() {
    return (
        <Container fluid className="p-0 ">
            <Router>
                <Header />

                <div className='min-vh-100'>
                <Routes>
                    <Route path='/' element={ <EventList/> } />
                    <Route path='/event/:id' element={ <EventPage /> }/>
                    <Route path='/event/create' element={ <EventCreationPage /> } />
                </Routes>
                </div>
    
                <Footer />
            </Router>
        </Container>
    );
}

export default App;
