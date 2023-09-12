import React from 'react';

import { AppShell, Container } from '@mantine/core';
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";

import Header from '../components/Header';
import Footer from '../components/Footer';

import EventsCreatePage from './events/Create';
import EventsSearchPage from './events/Search';
import EventsDetailsPage from './events/Details';
import ApplicationsCreatePage from './applications/Create';
import ApplicationsMyPage from './applications/My';
import EventsMyPage from './events/My';



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
                padding={0}
            >
                <Routes>
                    <Route path='/' element={ <EventsSearchPage/> } />
                    <Route path='/events/create' element={ <EventsCreatePage /> } />
                    <Route path='/events/:id' element={ <EventsDetailsPage /> }/>
                    <Route path='/events/my' element={ <EventsMyPage /> } />

                    <Route path='/applications/create/:id' element={ <ApplicationsCreatePage /> }/>
                    <Route path='/applications/my' element={ <ApplicationsMyPage /> } />
                </Routes>
            </AppShell>
        </Router>
    );
}


export default App;