import React from "react"

import { EventFormData } from "./EventForm";
import { ClaimRequest } from "@sismo-core/sismo-connect-react";
import { Center, Container, Title, Text, Button, Space } from "@mantine/core";

import { eventTypes, domain, EventData } from '@snaphost/api';

import { signTypedData } from '@wagmi/core'
import moment from "moment";

import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event } from '@snaphost/api';
import { useNavigate } from "react-router-dom";


export default function EventSubmit({
    eventFormData,
    claims,
    address
}: {
    eventFormData: EventFormData,
    claims: ClaimRequest[],
    address: string
}) {
    const navigate = useNavigate()

    const connection = rest('http://localhost:3030')
        .fetch(window.fetch.bind(window));

    const client = createClient(connection);

    console.log(eventFormData);

    const submit = async () => {
        const data: Omit<EventData, 'signature'> = {
            id: eventFormData.id,
            title: eventFormData.title,
            description: eventFormData.description,
            contacts: eventFormData.contacts,
            application_template: eventFormData.application_template,
            public_key: eventFormData.public_key,
            signature_public_key: eventFormData.signature_public_key,
            keystore: eventFormData.keystore,

            tags: eventFormData.tags,
            link: eventFormData.link === '' ? undefined : eventFormData.link,

            note: eventFormData.note,
            location: eventFormData.location,
            capacity: eventFormData.capacity,
            price: eventFormData.price,

            sismo: {
                auths: [],
                // @ts-ignore
                claims: claims,
            },

            registration_start: eventFormData.registration_start,
            registration_end: eventFormData.registration_end,
            start: eventFormData.start,
            end: eventFormData.end,

            timestamp: moment().toISOString(),
            owner: address,
            version: 0
        };

        const signature = await signTypedData({
            domain,
            message: {
                ...data,
                link: data.link || '',
            },
            primaryType: 'Event',
            types: eventTypes
        });

        const event = await client.service('events').create({
            ...data,
            signature
        });
        
        navigate(`/events/${event.id}`);
    }

    return (
        <Container>
            <Center>
                <Title order={2}>
                    Sign and submit your event
                </Title>
            </Center>

            <Space h='lg' />

            <Center>
                <Button onClick={() => submit()}>
                    Sign and submit
                </Button>
            </Center>
        </Container>
    );
}