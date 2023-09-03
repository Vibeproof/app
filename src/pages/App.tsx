import React from 'react';

import { AppShell, Container } from '@mantine/core';
import {
    BrowserRouter as Router,
    Routes,
    Route,
  } from "react-router-dom";
import Header from '../components/Header';
import EventsCreatePage from './events/Create';
import EventsSearchPage from './events/Search';
import Footer from '../components/Footer';


function App() {
    const header = <Header links={[
        { link: '/', label: 'Home' },
        { link: '/applications/my', label: 'My tickets' },
        { link: '/events/my', label: 'My events' },
        { link: '/events/create', label: 'Create an event' },
    ]}/>;

    const footer = <Footer />;

    return (
        <Router>
            <AppShell
                header={header}
                footer={footer}
                padding={50}
            >
                <Routes>
                    <Route path='/' element={ <EventsSearchPage/> } />
                    <Route path='/events/create' element={ <EventsCreatePage /> } />
                </Routes>
            </AppShell>
        </Router>
    );
}


export default App;