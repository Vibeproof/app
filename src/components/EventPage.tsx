import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';

import { useParams } from 'react-router-dom';
import { ClientApplication, createClient, Event } from '@snaphost/api';
import rest from '@feathersjs/rest-client';
import { Card } from 'react-bootstrap';


export interface IEventPageProps {
    params: any
}

export interface IEventPageState {
    id: string
    client: ClientApplication
    data: Event | null
}


class EventPage extends React.Component<IEventPageProps, IEventPageState> {
    constructor(props: IEventPageProps) {
        super(props);

        const connection = rest('http://localhost:3030')
            .fetch(window.fetch.bind(window));

        this.state = {
            id: props.params.id,
            client: createClient(connection),
            data: null,
        };
    }

    async componentDidMount() {
        const data = await this.state.client.service('events').get(this.state.id);

        this.setState({ data: data });
    }

    render() {
        return (
            <Container fluid='sm' className='pt-5'>
                <Row className='pt-4 pb-5'>
                    <Col>
                        <h1 className='p-0'>{ this.state.data?.title }</h1>
                        <a className='p-0' href={this.state.data?.link}>{this.state.data?.link}</a>
                    </Col>
                </Row>

                <Row>
                    <Col md={7} style={{ whiteSpace: 'pre-line' }}>
                        <Row>
                            <Col>
                                { this.state.data?.description }
                            </Col>
                        </Row>

                        <Row className=''>
                            <Col>
                                <h3 className='pt-4 pb-2'>Requirements</h3>

                                <Row xs={1} md={1} lg={1} className="g-4">
                                    <Col>
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>Gitcoin Passport Holders</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
                                                <Card.Text>
                                                Data Group of all addresses that own a Gitcoin Passport.
                                                </Card.Text>
                                                <Card.Link href="#">Sismo group</Card.Link>
                                                <Card.Link href="#">Members</Card.Link>
                                            </Card.Body>
                                        </Card>
                                    </Col>                         
                                </Row>
                            </Col>
                        </Row>
                    </Col>

                    <Col md={{ span: 4, offset: 1 }}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Organizer</Card.Title>
                                <Card.Subtitle className="">
                                    <a href="#">pavlovdog.eth</a>
                                </Card.Subtitle>

                                <hr></hr>

                                <Card.Title>Location</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    { this.state.data?.location }
                                </Card.Subtitle>

                                <hr></hr>

                                <Card.Title>Date and time</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    { this.state.data?.start }
                                </Card.Subtitle>

                                <hr></hr>

                                {/* <Card.Title>Required public data</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    Twitter, EVM address
                                </Card.Subtitle>

                                <hr></hr> */}

                                <Card.Title>Capacity</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    { this.state.data?.capacity }
                                </Card.Subtitle>

                                <Button className="mt-3 w-100" variant="primary">Join</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default (props:any) => (
    <EventPage {...props} params={useParams()}/>
);