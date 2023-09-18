import { ActionIcon, Avatar, Badge, Button, Card, Center, Grid, Group, Loader, Modal, ScrollArea, Table, Text, TextInput, useMantineTheme } from "@mantine/core";
import React, { useEffect } from "react";

import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, cryptography, Event, EventApplication, EventApplicationResponseData, Keystore, ResponseType } from '@vibeproof/api';
import { useAccount } from "wagmi";

import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { decodeBase64, encodeUTF8 } from "tweetnacl-util";
import moment from "moment";
import { HUMAN_DATE_TIME_FORMAT } from "../../utils";
import AddressAvatar from "../AddressAvatar";
import { renderDataURI } from "@codingwithmanny/blockies";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from '@mantine/notifications';
import { IconArrowRight, IconSearch, IconShieldOff, IconUserOff } from "@tabler/icons-react";
import ApplicationDetails from "./ApplicationDetails";
import { getApplicationBadge } from "../../utils/applications";
import Loading from "../Loading";
import Empty from "../Empty";
import { box, sign, BoxKeyPair, SignKeyPair } from "tweetnacl";
import { client } from "../../utils/client";


interface ApplicationDecrypted {
    message: string;
    contacts: Object;
}


export default function ApplicationsManager({
    event,
}: {
    event: Event;
}) {
    const theme = useMantineTheme();
    const { address, isConnected } = useAccount();
    const [keystore, setKeystore] = React.useState<Keystore | null>(null);
    const [applications, setApplications] = React.useState<EventApplication[] | null>(null);
    const [reviewedApplication, setReviewedApplication] = React.useState<EventApplication | null>(null);
    
    useEffect(() => {
        const fetchApplications = async () => {
            const {
                data: applications
            } = await client.service('event-applications').find({
                query: {
                    event_id: event.id
                }
            });

            setApplications(applications);
        }

        fetchApplications();
    }, []);
    
    const decryptKeystore = async () => {
        const client = createWalletClient({
            chain: mainnet,
            // @ts-ignore
            transport: custom(window.ethereum)
        });

        const keystore_decrypted = await client.request({
            // @ts-ignore
            method: 'eth_decrypt',
            params: [
                // @ts-ignore
                encodeUTF8(decodeBase64(event.keystore)),
                address as string
            ],
        }).then((result: any) => JSON.parse(result));

        setKeystore(keystore_decrypted);
    };

    const applicationCards = applications?.map((application: EventApplication, i) => {
        return (
            <Grid.Col lg={4} sm={12} key={i}>
                <Card withBorder>
                    <Group position="apart">
                        <Group>
                            <Avatar size='md' src={ renderDataURI({ seed: application.owner }) } /> 
                            <div>
                                <Text size="sm">{ `${application.owner.slice(0, 6)}...${application.owner.slice(36)}` }</Text>
                                <Text size="xs" color="dimmed">
                                    { moment(application.timestamp).fromNow() }
                                </Text>
                            </div>
                        </Group>

                        { getApplicationBadge(application) }
                    </Group>

                    <Button mt='lg' fullWidth onClick={async () => {
                        if (keystore === null) {
                            if (address === event.owner) {
                                await decryptKeystore();
                                await setReviewedApplication(application);
                            } else if (isConnected === false) {
                                notifications.show({
                                    title: 'Connect wallet',
                                    message: 'Connect wallet to decrypt the applications',
                                    color: 'yellow'
                                });
                            } else {
                                notifications.show({
                                    title: 'Wrong address',
                                    message: 'The connected address is not the event\'s owner. Try different address.',
                                    color: 'red'
                                });
                            }
                        } else {
                            setReviewedApplication(application);
                        }
                    }}>Review</Button>
                </Card>
            </Grid.Col>
        );
    });

    const decryptApplicationMessage = (
        application: EventApplication,
        keystore: Keystore
    ) => {
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

        return message;
    }

    const decryptApplicationContacts = (
        application: EventApplication,
        keystore: Keystore
    ) => {
        const ephemeralKeyPair = box.keyPair.fromSecretKey(decodeBase64(keystore.privateKey));

        const shared = box.before(
            decodeBase64(application.public_key),
            ephemeralKeyPair.secretKey
        );    

        const shared_key = cryptography.assymetric.decrypt(
            shared,
            application.shared_key
        );

        const contacts = JSON.parse(
            cryptography.symmetric.decrypt(application.contacts, shared_key)
        );

        return contacts;
    }

    if (applications === null) {
        return <Loading />;
    }

    if (applications.length === 0) {
        return <Empty 
            icon={<IconUserOff size={28} />} 
            text="No applications yet"
        />;
    }

    const setApplicationResponse = async (
        response: ResponseType,
        application: EventApplication,
        keystore: Keystore
    ) => {
        const ephemeralKeyPair = box.keyPair.fromSecretKey(decodeBase64(keystore.privateKey));

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

        await client.service('event-application-responses').create({
            ...data,
            signature
        });
    }

    return (
        <>
            <Modal 
                centered
                size='lg'
                withCloseButton={false}
                opened={reviewedApplication !== null}
                onClose={() => setReviewedApplication(null)} 
                overlayProps={{
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
                    opacity: 0.55,
                    blur: 3,
                }}
            >
                {
                    keystore !== null &&
                    reviewedApplication !== null &&
                    (
                        <ApplicationDetails 
                            defaultTab="message"
                            application={reviewedApplication}
                            message={decryptApplicationMessage(reviewedApplication, keystore)}
                            contacts={decryptApplicationContacts(reviewedApplication, keystore)}
                            note=''
                            setApplicationResponse={async (response: ResponseType) => {
                                await setApplicationResponse(
                                    response,
                                    reviewedApplication,
                                    keystore
                                );
                            }}
                        />
                    )
                }
            </Modal>

            <Grid>
                { applicationCards }
            </Grid>
        </>
    );
}