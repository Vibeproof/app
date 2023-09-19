import React from "react"

import { EventFormData } from "./EventForm";
import { ClaimRequest } from "@sismo-core/sismo-connect-react";
import { Center, Container, Title, Text, Button, Space } from "@mantine/core";

import { eventTypes, domain, EventData } from '@vibeproof/api';

import { signTypedData } from '@wagmi/core'
import moment from "moment";

import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event } from '@vibeproof/api';
import { useNavigate } from "react-router-dom";
import { client } from "../../utils/client";


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

    const [submitting, setSubmitting] = React.useState<boolean>(false);

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
            link: eventFormData.link,

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

        console.log(data);
        console.log(domain);

        const signature = await signTypedData({
            domain,
            message: {
                ...data,
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
                <Button loading={submitting} onClick={() => {
                    setSubmitting(true);

                    submit()
                        .catch(e => {
                            setSubmitting(false);
                        })
                        .then(() => {
                            setSubmitting(false);
                        })
                }}>
                    { submitting ? 'Submitting' : 'Sign and submit' }
                </Button>
            </Center>
        </Container>
    );
}