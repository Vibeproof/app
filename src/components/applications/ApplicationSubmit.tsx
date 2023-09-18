import React from "react";
import { ApplicationFormData } from "./ApplicationForm";
import { SismoConnectResponse } from "@sismo-core/sismo-connect-react";
import { useNavigate } from "react-router-dom";
import rest from '@feathersjs/rest-client';
import {
    applicationTypes,
    createClient,
    domain,
    Event,
    EventApplication, 
    EventApplicationData,
} from '@vibeproof/api';
import { Button, Center, Container, Title, Space } from "@mantine/core";
import moment from "moment";
import { signTypedData } from '@wagmi/core'
import { decodeUTF8, encodeBase64 } from "tweetnacl-util";
import { client } from "../../utils/client";


export default function ApplicationSubmit({
    event,
    address,
    applicationFormData,
    sismoResponse,
}: {
    event: Event,
    address: string,
    applicationFormData: ApplicationFormData,
    sismoResponse: SismoConnectResponse,
}) {
    const navigate = useNavigate();

    const submit = async () => {
        const data: Omit<EventApplicationData, 'signature'> = {
            id: applicationFormData.id,
            public_key: applicationFormData.public_key,
            keystore: applicationFormData.keystore,

            event_id: event.id,
            message: applicationFormData.message,
            contacts: applicationFormData.contacts,
            proof: encodeBase64(decodeUTF8(JSON.stringify(sismoResponse))),

            shared_key: applicationFormData.shared_key,

            timestamp: moment().toISOString(),
            owner: address,
            version: 0,
        };

        const signature = await signTypedData({
            domain,
            message: {
                ...data                
            },
            primaryType: 'Application',
            types: applicationTypes
        });

        const eventApplication = await client.service('event-applications').create({
            ...data,
            signature
        });

        navigate(`/applications/my`);
    }

    return (
        <Container>
            <Center>
                <Title order={2}>
                    Sign and submit your application
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