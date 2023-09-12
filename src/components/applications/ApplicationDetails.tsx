import { Avatar, Button, Card, Grid, Group, Table, Text, TextInput } from "@mantine/core";
import { ClientApplication, EventApplication, EventApplicationResponseData, Keystore, ResponseType, cryptography } from "@snaphost/api";
import React from "react";
import { decodeBase64 } from "tweetnacl-util";
import { box, sign, BoxKeyPair, SignKeyPair } from "tweetnacl";
import { renderDataURI } from "@codingwithmanny/blockies";
import moment from "moment";
import { getApplicationBadge, getContactInputIcon } from "../../utils/applications";
import { HUMAN_DATE_TIME_FORMAT } from "../../utils";
import { IconAt } from "@tabler/icons-react";


export default function ApplicationDetails({
    application,
    keystore,
    client,
}: {
    application: EventApplication,
    keystore: Keystore,
    client: ClientApplication
}) {
    const ephemeralKeyPair = box.keyPair.fromSecretKey(decodeBase64(keystore.privateKey));

    const shared = box.before(
        decodeBase64(application.public_key),
        ephemeralKeyPair.secretKey
    );

    const shared_key = cryptography.assymetric.decrypt(
        shared,
        application.shared_key
    );

    const message = cryptography.symmetric.decrypt(
        application.message,
        shared_key
    );

    const contacts = JSON.parse(
        cryptography.symmetric.decrypt(application.contacts, shared_key)
    );

    const contactRows = Object.keys(contacts).map((contact, i) => {
        return (
            <tr key={i}>
                <td>
                    <Group>
                        { getContactInputIcon(contact) }
                        { contact }
                    </Group>
                </td>
                <td>{ contacts[contact] }</td>
            </tr>
        );
    });

    const setApplicationResponse = async (response: ResponseType) => {
        const shared = box.before(
            decodeBase64(application.public_key),
            ephemeralKeyPair.secretKey
        );

        const shared_key = cryptography.assymetric.encrypt(
            shared,
            keystore.encryptionKey
        );

        const data: Omit<EventApplicationResponseData, 'signature'> = {
            id: crypto.randomUUID() as string,
            type: response,
            event_application_id: application.id,
            shared_key: response === ResponseType.APPROVED ? shared_key : '',
            timestamp: moment().toISOString(),
            version: 0,
        };

        const signatureKeyPair = sign.keyPair.fromSecretKey(decodeBase64(keystore.signatureKey));

        const signature = cryptography.signature.sign(
            JSON.stringify(data),
            signatureKeyPair.secretKey
        );

        console.log(123);

        await client.service('event-application-responses').create({
            ...data,
            signature
        });
    }
    
    return (
        <Card>
            <Card.Section>
                <Group position="apart">
                    <Group>
                        <Avatar size='md' src={ renderDataURI({ seed: application.owner }) } /> 
                        <div>
                            <Text size="sm">{ `${application.owner.slice(0, 6)}...${application.owner.slice(36)}` }</Text>
                            <Text size="xs" color="dimmed">
                                { moment(application.timestamp).format(HUMAN_DATE_TIME_FORMAT) }
                            </Text>
                        </div>
                    </Group>

                    { getApplicationBadge(application) }
                </Group>
            </Card.Section>

            <Card.Section mt='lg'>
                <Text weight={500}>Contacts</Text>
                <Table>
                    <tbody>
                        { contactRows }
                    </tbody>
                </Table>
            </Card.Section>

            <Card.Section mt='lg'>
                <Text weight={500}>Message</Text>
                <Text size='sm' color="dimmed">
                    { message }
                </Text>
            </Card.Section>

            <Card.Section inheritPadding mt='lg'>
                <Group position="right">
                    <Button color="red" onClick={() => setApplicationResponse(ResponseType.REJECTED)}>
                        Reject
                    </Button>

                    <Button color="green" onClick={() => setApplicationResponse(ResponseType.APPROVED)}>
                        Approve
                    </Button>
                </Group>
            </Card.Section>
        </Card>
    );
}
