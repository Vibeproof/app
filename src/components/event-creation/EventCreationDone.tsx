import React, { useEffect } from "react";
import { Col, Container, Row, Button } from "react-bootstrap";
import { EventInputFields } from "./EventCreationForm";
import axios from "axios";

import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event, EventData } from '@snaphost/api';
import { useSignTypedData } from 'wagmi'
import moment from "moment";

import { eventTypes, domain } from '@snaphost/api';

const connection = rest('http://localhost:3030').fetch(window.fetch.bind(window));


function EventCreationDone({
    eventId,
    address,
    claims,
    noteEncrypted,
    public_key,
    inputFields 
}: {
    eventId: string,
    address: string,
    claims: any[],
    noteEncrypted: string,
    public_key: string,
    inputFields: EventInputFields
}) {
    const timestamp = moment().toISOString();
    const registration_start = moment().toISOString();
    const registration_end = moment(inputFields.start).subtract(1, 'minute').toISOString();

    const [done, setDone] = React.useState<boolean>(false);

    const { data, isError, isSuccess, signTypedData, error } = useSignTypedData({
        domain,
        message: {
            id: eventId,
            title: inputFields.title,
            description: inputFields.description,
            public_key,

            tags: inputFields.tags,
            link: '',

            note: noteEncrypted,
            location: inputFields.location,
            // @ts-ignore
            capacity: inputFields.capacity,
            // @ts-ignore
            price: 0,

            registration_start,
            registration_end,
            start: inputFields.start.toISOString(),
            end: inputFields.end.toISOString(),

            sismo: {
                auths: [],
                claims: claims
            },

            version: 0,
            timestamp,
            // @ts-ignore
            owner: address,
        },
        primaryType: 'Event',
        types: eventTypes
    });

    const signEvent = async () => {
        signTypedData();
    };

    // useEffect(() => {
    //     const client = createClient(connection);
    //     console.log('uploading event');

    //     const eventData: EventData = {
    //         // @ts-ignore
    //         id: eventId,
    //         title: inputFields.title,
    //         description: inputFields.description,
    //         public_key: '0x123123',

    //         tags: inputFields.tags,
    //         link: '',

    //         note: noteEncrypted,
    //         location: inputFields.location,
    //         capacity: inputFields.capacity,
    //         price: 0,

    //         registration_start: registration_start,
    //         registration_end: registration_end,
    //         start: inputFields.start.toISOString(),
    //         end: inputFields.end.toISOString(),

    //         sismo: {
    //             auths: [],
    //             claims: claims
    //         },

    //         timestamp,
    //         owner: address,
    //         version: 0,
    //         // @ts-ignore
    //         signature: data
    //     };

    //     client.service('events').create({
    //         ...eventData
    //     }).then((r: any) => {
    //         console.log(r);
    //         setDone(true);
    //     });
    // }, [data]);

    return (
        <Container>
            <Row>
                <Col style={{ textAlign: 'center' }}>
                    <h1>Done</h1>
                    <p>Your event is ready!</p>
                </Col>
            </Row>

            <Row>
                <Col>
                    <h2>Event details</h2>
                    <p>done: { `${done}` }</p>
                    <Button onClick={() => signEvent()}>
                        Create event
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}


export default EventCreationDone;