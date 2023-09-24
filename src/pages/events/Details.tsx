import React, { useEffect } from 'react';

import { Container, createStyles, Grid, Overlay, rem, Title, Text, Button, Image, Card, Divider, Loader, Center, Anchor, Tabs, Badge, Group, Modal, useMantineTheme } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import { ClientApplication, createClient, cryptography, Event, EventApplication, Keystore, ResponseType } from '@vibeproof/api';
import moment from 'moment';
import { HUMAN_DATE_TIME_FORMAT } from '../../utils';
import { IconInfoCircle, IconInfoCircleFilled, IconMessageCircle, IconPhoto, IconSettings, IconShield } from '@tabler/icons-react';
import ApplicationsManager from '../../components/applications/ApplicationsManager';
import { useAccount } from 'wagmi';
import { fetchEnsName } from '@wagmi/core'
import Loading from '../../components/Loading';
import EventRequirements from '../../components/events/EventRequirements';
import { useWindowScroll } from '@mantine/hooks';
import ApplicationDetails from '../../components/applications/ApplicationDetails';
import { notifications } from '@mantine/notifications';
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { decodeBase64, encodeUTF8 } from "tweetnacl-util";
import { box, sign, BoxKeyPair, SignKeyPair } from "tweetnacl";
import { client } from '../../utils/client';
import { signMessage } from '@wagmi/core'
import * as text from './../../utils/text';


const useStyles = createStyles((theme) => ({
    description: {
        whiteSpace: 'pre-wrap'
    },
    spec: {
        header: {
            fontWeight: 700,
        }
    }
}));


enum ApplicationStatus {
    NOT_EXISTS = 'not_exists',
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}


export default function EventsDetailsPage() {
    const params = useParams();
    const navigate = useNavigate();
    const [, scrollTo] = useWindowScroll();
    const theme = useMantineTheme();
    const { address, isConnected } = useAccount();

    const [event, setEvent] = React.useState<Event | null>(null);
    const [reviewedApplication, setReviewedApplication] = React.useState<EventApplication | null>(null);
    const [applicationStatus, setApplicationStatus] = React.useState<ApplicationStatus | null>(null);
    const [application, setApplication] = React.useState<EventApplication | null>(null);
    const [keystore, setKeystore] = React.useState<Keystore | null>(null);

    useEffect(() => {
        scrollTo({ y: 0 });

        const fetchEvent = async () => {
            const event = await client.service('events').get(params.id as string);

            setEvent(event);
        }

        fetchEvent();
    }, []);

    useEffect(() => {
        const fetchApplication = async () => {
            if (!isConnected || address === undefined) {
                setApplicationStatus(ApplicationStatus.NOT_EXISTS);
                setApplication(null);

                return;
            }

            const applications = await client.service('event-applications').find({
                query: {
                    event_id: params.id,
                    owner: address
                }
            });
            
            if (applications.total === 0) {
                setApplicationStatus(ApplicationStatus.NOT_EXISTS);
                setApplication(null);
            } else {
                const {
                    data: [application]
                } = applications;

                if (application.response === null) {
                    setApplicationStatus(ApplicationStatus.PENDING);
                } else if (application.response.type === ResponseType.APPROVED) {
                    setApplicationStatus(ApplicationStatus.APPROVED);
                } else {
                    setApplicationStatus(ApplicationStatus.REJECTED);
                }

                setApplication(application);
            }
        };

        fetchApplication();
    }, [address, isConnected]);

    const { classes } = useStyles();

    const openTicket = async () => {
        console.log('opening')
    }

    const applyButton = () => {
        if (applicationStatus === null) return null;

        if (applicationStatus === ApplicationStatus.NOT_EXISTS) {
            if (moment().isAfter(event?.end)) {
                return (
                    <Button 
                        fullWidth 
                        mt='lg' 
                        disabled
                    >
                        Event has already ended
                    </Button>
                );
            } else if (moment().isAfter(event?.start)) {
                return (
                    <Button 
                        fullWidth 
                        mt='lg' 
                        disabled
                    >
                        Event has already started
                    </Button>
                );
            } else {
                return (
                    <Button 
                        fullWidth 
                        mt='lg' 
                        onClick={() => navigate(`/applications/create/${params.id}`)}
                    >
                        Apply
                    </Button>
                );    
            }
        } else if (applicationStatus === ApplicationStatus.PENDING) {
            return (
                <Button
                    fullWidth
                    mt='lg'
                    disabled
                >
                    Application is pending
                </Button>
            );
        } else if (applicationStatus === ApplicationStatus.APPROVED) {
            return (
                <Button
                    fullWidth
                    mt='lg'
                    color='green'
                    onClick={async () => {
                        if (application === null) return null;

                        if (keystore === null) {
                            if (address === application.owner) {
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
                                    message: 'The connected address is not the invite\'s owner. Try different address.',
                                    color: 'red'
                                });
                            }
                        } else {
                            setReviewedApplication(application);
                        }
                    }}
                >
                    View ticket
                </Button>
            );
        } else {
            return (
                <Button
                    fullWidth
                    mt='lg'
                    color='red'
                    disabled
                >
                    Rejected
                </Button>
            );
        }
    };

    const decryptKeystore = async () => {
        if (application === null) return;

        const signature = await signMessage({
            message: text.applicationSignatureRequest(application.id),
        });
        
        const walletKey = cryptography.symmetric.generateKey(signature);

        const keystore_decrypted = cryptography.symmetric.decrypt(
            application.keystore,
            walletKey
        );
  
        setKeystore(JSON.parse(keystore_decrypted));
    };

    const decryptApplicationContacts = (application: EventApplication, keystore: Keystore) => {
        const contacts = cryptography.symmetric.decrypt(
            application.contacts,
            keystore.encryptionKey
        );

        return JSON.parse(contacts);
    }

    const decryptApplicationMessage = (application: EventApplication, keystore: any) => {
        const message = cryptography.symmetric.decrypt(
            application.message,
            keystore.encryptionKey
        );

        return message;
    }

    const decryptEventNote = (event: Event, keystore: Keystore) => {
        if (application === null) return '';

        console.log(keystore);

        const ephemeralKeyPair = box.keyPair.fromSecretKey(decodeBase64(keystore.ephemeralSecretKey));

        const shared = box.before(
            decodeBase64(event.public_key),
            ephemeralKeyPair.secretKey
        );

        const shared_key = cryptography.assymetric.decrypt(
            shared,
            application.response.shared_key
        );

        const note = cryptography.symmetric.decrypt(
            application.event.note,
            shared_key
        );

        return note;
    }

    if (event === null || applicationStatus == null) {
        return <Loading />;
    }

    return (
        <>
            <Modal 
                centered
                title='Application'
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
                            defaultTab="note"
                            application={reviewedApplication}
                            message={decryptApplicationMessage(reviewedApplication, keystore)}
                            contacts={decryptApplicationContacts(reviewedApplication, keystore)}
                            note={decryptEventNote(event, keystore)}
                            showApproveButtons={false}
                        />
                    )
                }
            </Modal>

            <Container size='lg'>
                <Grid>
                    <Grid.Col span={12} mb='sm'>
                        <Image height={400} src={event.image} withPlaceholder/>
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Tabs color="dark" defaultValue="about">
                            <Tabs.List mb='md'>
                                <Tabs.Tab value="about" icon={<IconInfoCircle size="0.8rem" />}>
                                    About
                                </Tabs.Tab>
                                
                                <Tabs.Tab value="requirements" icon={<IconShield size="0.8rem" />}>
                                    Claims
                                </Tabs.Tab>

                                <Tabs.Tab 
                                    value="messages"
                                    icon={<IconMessageCircle size="0.8rem" />}
                                    rightSection={
                                        <Badge w={16} h={16} sx={{ pointerEvents: 'none' }} variant="filled" size="xs" p={0}>
                                            { event.applications }
                                        </Badge>
                                    }
                                >
                                    Applications
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="about" pt="xs">
                                <Grid>
                                    <Grid.Col span={8}>
                                        <Title>{ event?.title }</Title>
                                        <Anchor href={ event.link } target='_blank'>{ event.link }</Anchor>

                                        <Text className={classes.description} mt='lg'>
                                            { event?.description }
                                        </Text>
                                    </Grid.Col>

                                    <Grid.Col span={4}>
                                        <Card withBorder>
                                            <Title order={5} className={classes.spec}>Owner</Title>
                                            <Anchor fz='md' href='#'> { `${event.owner.slice(0,7)}...${event.owner.slice(35)}` } </Anchor>

                                            <Divider my='sm'/>

                                            <Title order={5} className={classes.spec}>Location</Title>
                                            <Text>{ event.location ? event.location : 'Online' }</Text>

                                            <Divider my='sm'/>

                                            <Title order={5} className={classes.spec}>Start at</Title>
                                            <Text>{ moment(event.start).format(HUMAN_DATE_TIME_FORMAT) }</Text>

                                            <Divider my='sm'/>

                                            <Title order={5} className={classes.spec}>Ends at</Title>
                                            <Text>{ moment(event.end).format(HUMAN_DATE_TIME_FORMAT) }</Text>

                                            <Divider my='sm'/>

                                            <Title order={5} className={classes.spec}>Tags</Title>
                                            <Group mt='xs' spacing='xs'>
                                                {
                                                    event.tags.map((tag, i) => {
                                                        return (
                                                            <Badge key={i}>{tag}</Badge>
                                                        );
                                                    }) 
                                                }
                                            </Group>

                                            { applyButton() }
                                        </Card>
                                    </Grid.Col>
                                </Grid>
                            </Tabs.Panel>

                            <Tabs.Panel value="messages" pt="xs">
                                <Grid>
                                    <Grid.Col span={12}>
                                        <ApplicationsManager event={event}/>
                                    </Grid.Col>
                                </Grid>
                            </Tabs.Panel>

                            <Tabs.Panel value="requirements" pt="xs">
                                <Grid>
                                    <Grid.Col span={12}>
                                        <EventRequirements event={event} />
                                    </Grid.Col>
                                </Grid>
                            </Tabs.Panel>
                        </Tabs>
                    </Grid.Col>
                </Grid>
            </Container>
        </>
    );
}