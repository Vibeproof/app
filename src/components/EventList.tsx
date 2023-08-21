import React from 'react';


import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event } from '@snaphost/api';

import EventCard from './EventCard';

export interface IEventListProps {

}

export interface IEventListState {
    client: ClientApplication
    events: Event[]
}


class EventList extends React.Component<IEventListProps, IEventListState> {
    constructor(props: IEventListProps) {
        super(props);

        const connection = rest('http://localhost:3030')
            .fetch(window.fetch.bind(window));

        this.state = {
            client: createClient(connection),
            events: [],
        };
    }

    async componentDidMount() {
        const data = await this.state.client.service('events').find();

        this.setState({
            events: data.data
        });
    }

    render() {
        const events = this.state.events.map((e, i) => <EventCard data={e} key={i} /> );

        return (
            <Container fluid='sm' className='pt-4'>
                <Row xs={1} md={3} className="g-4">
                    <Col>
                        { events }
                    </Col>
                </Row>            
            </Container>
        );
    }
}


export default EventList;