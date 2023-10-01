import React, { useEffect } from "react";


import { Button, Card, Container, Group, Text, Image, Title, Anchor, Grid, Tabs, Badge } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { client } from "../../utils/client";
import { useParams } from "react-router-dom";
import { Event, EventPatch, applicationTypes, domain, eventTypes } from '@vibeproof/api';
import Loading from "../../components/Loading";
import { signTypedData } from '@wagmi/core'
import { useAccount } from "wagmi";
import { notifications } from "@mantine/notifications";
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { random } from "lodash";
import { IconInfoCircle, IconMessageCircle, IconPencil, IconSettings, IconShield, IconUser } from "@tabler/icons-react";
import ApplicationsManager from "../../components/applications/ApplicationsManager";


export default function EventsEditPage() {
    const params = useParams();
    const [, scrollTo] = useWindowScroll();
    const [event, setEvent] = React.useState<Event | null>(null);
    const [editAllowed, setEditAllowed] = React.useState(false);
    const { address, isConnected } = useAccount();

    const [updatingImage, setUpdatingImage] = React.useState<boolean>(false);
    const [updatingPublic, setUpdatingPublic] = React.useState<boolean>(false);
    const [updatingPaused, setUpdatingPaused] = React.useState<boolean>(false);


    useEffect(() => {
        scrollTo({ y: 0 });

        const fetchEvent = async () => {
            const event = await client.service('events').get(params.id as string);

            setEvent(event);
        }

        fetchEvent();
    }, []);

    useEffect(() => {
        if (event === null) {
            return;
        }

        if (address === event.owner) {
            setEditAllowed(true);
        } else if (address === undefined) {
            setEditAllowed(false);

            notifications.show({
                title: 'Connect wallet',
                message: 'Connect wallet to edit the event',
                color: 'yellow'
            });
        } else {
            setEditAllowed(false);

            notifications.show({
                title: 'Change address',
                message: 'This event is owned by another address',
                color: 'red'
            });
        }
    }, [address, event]);

    if (event === null) {
        return <Loading />;
    }

    const patch = async (patchData: Omit<EventPatch, 'signature'>) => {
        // const wallet_client = createWalletClient({
        //     chain: mainnet,
        //     // @ts-ignore
        //     transport: custom(window.ethereum)
        //   })

        // const patchData = {
        //     title: 'New title',
        //     description: 'Join us to drink beer and eat pizza',
        // } as Omit<EventPatch, 'signature'>;
   
        console.log('patch data', patchData);
        const event = await client.service('events').get(params.id as string);
    
        const data = {
            ...event,
            ...patchData
        };

        const signature = await signTypedData({
            domain,
            message: {
                ...data
            },
            primaryType: 'Event',
            types: eventTypes,
        });
    
        const response = await client.service('events').patch(params.id as string, {
            ...patchData,
            signature
        });

        return response;
    }

    return (
        <Container size='lg'>
            <Grid>
                <Grid.Col span={12} mb='xl' mt='sm'>
                    <Image height={400} radius='md' src={event.image.src} withPlaceholder/>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Tabs color='dark' defaultValue='applications'>
                        <Tabs.List mb='lg'>
                            <Tabs.Tab 
                                value="applications"
                                icon={<IconUser size="0.8rem" />}
                                rightSection={
                                    <Badge w={16} h={16} sx={{ pointerEvents: 'none' }} variant="filled" size="xs" p={0}>
                                        { event.applications }
                                    </Badge>
                                }
                            >
                                Applications
                            </Tabs.Tab>

                            {/* <Tabs.Tab value="general" icon={<IconPencil size="0.8rem" />}>
                                General
                            </Tabs.Tab> */}

                            <Tabs.Tab value="settings" icon={<IconSettings size="0.8rem" />}>
                                Settings
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="applications">
                            <Grid>
                                <Grid.Col span={12}>
                                    <ApplicationsManager event={event}/>
                                </Grid.Col>
                            </Grid>
                        </Tabs.Panel>

                        <Tabs.Panel value="general">
                            <Grid>
                                <Grid.Col span={12}>
                                    
                                </Grid.Col>
                            </Grid>
                        </Tabs.Panel>

                        <Tabs.Panel value="settings">
                            <Group position='apart' mb='lg'>
                                <div>
                                    <Text size='lg'>Update event image</Text>
                                    <Text c='dimmed'>Re-generate event image. Be carefull - this action can't be reversed!</Text>
                                </div>

                                <Button variant="outline" color='red' loading={updatingImage} disabled={!editAllowed} onClick={() => {
                                    setUpdatingImage(true);

                                    patch({
                                        seed: random(0, 100000)
                                    }).then((response) => {
                                        setUpdatingImage(false);
                                        setEvent(response);
                                    }).catch((e) => {
                                        setUpdatingImage(false);
                                        console.log(e);
                                    });
                                }}>Update image</Button>
                            </Group>

                            <Group position='apart' mb='lg'>
                                <div>
                                    <Text size='lg'>Change event visibility</Text>
                                    <Text c='dimmed'>This event is currently { event.public ? 'public' : 'private' }. Private events are not shown on the main page</Text>
                                    <Text c='dimmed'>Hidden events are still accesible with direct link</Text>
                                </div>

                                <Button variant="outline" color='red' loading={updatingPublic} disabled={!editAllowed} onClick={() => {
                                    setUpdatingPublic(true);

                                    patch({
                                        public: !event.public,
                                    }).then((response) => {
                                        setEvent(response);

                                        console.log(response.image);
                                        setUpdatingPublic(false);
                                    }).catch((e) => {
                                        setUpdatingPublic(false);
                                        console.log(e);
                                    });
                                }}>Make event { !event.public ? 'public' : 'private' }</Button>
                            </Group>

                            <Group position='apart'>
                                <div>
                                    <Text size='lg'>{ event.paused ? 'Unpause' : 'Pause' } accepting new applications</Text>
                                    <Text c='dimmed'>New users will be unable to apply for event</Text>
                                </div>                        

                                <Button variant="outline" color='red' loading={updatingPaused} disabled={!editAllowed} onClick={() => {
                                    setUpdatingPaused(true);

                                    patch({
                                        paused: !event.paused,
                                    }).then((response) => {
                                        setUpdatingPaused(false);
                                        setEvent(response);
                                    }).catch((e) => {
                                        setUpdatingPaused(false);
                                        console.log(e);
                                    });
                                }}>
                                    { event.paused ? 'Unpause' : 'Pause' } event
                                </Button>
                            </Group>

                        </Tabs.Panel>
                    </Tabs>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
