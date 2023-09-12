import { ActionIcon, Avatar, Badge, Button, Card, Center, Grid, Group, Loader, Modal, ScrollArea, Table, Text, TextInput, useMantineTheme } from "@mantine/core";
import React, { useEffect } from "react";

import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event, EventApplication, Keystore, ResponseType } from '@snaphost/api';
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
import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import ApplicationDetails from "./ApplicationDetails";
import { getApplicationBadge } from "../../utils/applications";


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
    
    const connection = rest('http://localhost:3030')
        .fetch(window.fetch.bind(window));
    const client = createClient(connection);

    useEffect(() => {
        const fetchApplications = async () => {
            const {
                data: applications
            } = await client.service('event-applications').find({
                query: {
                    event_id: event.id
                }
            });

            console.log(applications);

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

        // console.log(encodeUTF8(decodeBase64(event.keystore)));

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
            <Grid.Col lg={4} sm={12}>
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
                                    message: 'Connect wallet to decrypt the event application',
                                    color: 'red'
                                });
                            } else {
                                notifications.show({
                                    title: 'Wrong address',
                                    message: 'The connected address is not the event\'s owner',
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

    if (applications === null) {
        return (
            <Center mih={700}>
                <Loader />
            </Center>
        );
    }

    return (
        <>
            <Modal 
                centered
                withCloseButton={false}
                opened={reviewedApplication !== null}
                onClose={() => setReviewedApplication(null)} 
                // title="Review application"
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
                            application={reviewedApplication}
                            keystore={keystore}
                            client={client}
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