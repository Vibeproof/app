import React from 'react';


import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';

import { Event } from '@snaphost/api';
import { Link } from 'react-router-dom';

export interface IEventCardProps {
    data: Event
}

export interface IEventCardState {
    data: Event
}


class EventCard extends React.Component<IEventCardProps, IEventCardState> {
    constructor(props: IEventCardProps) {
        super(props);

        this.state = {
            data: props.data
        }
    }

    render() {
        return (
            <Card className='h-100'>
                <Card.Body>
                    <Card.Title>
                        <Link to={`event/${this.state.data.id}`} className='link-dark'>{ this.state.data.title }</Link>
                    </Card.Title>

                    <Card.Subtitle className="mb-2 text-muted">22 Aug 2023, 10:30am</Card.Subtitle>

                    <Card.Text>
                        { this.state.data.description.slice(0, 140) }...
                    </Card.Text>

                    <Card.Text>
                        <span className='fw-bold'>Tags:</span>
                        <Badge className='m-1' bg="primary" as={"a"} href='#tennis'>Tennis</Badge>
                        <Badge className='m-1' bg="primary" as={"a"} href='#ethcc'>ETHCC</Badge>
                        <Badge className='m-1' bg="primary" as={"a"} href='#wagmi'>WAGMI</Badge>
                    </Card.Text>

                </Card.Body>

                <Card.Footer className="text-muted">{ this.state.data.location }</Card.Footer>
            </Card>
        );
    }
}


export default EventCard;