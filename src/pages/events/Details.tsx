import React, { useEffect } from 'react';

import { Container, createStyles, Grid, Overlay, rem, Title, Text, Button, Image, Card, Divider, Loader, Center, Anchor, Tabs, Badge, Group } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event, EventApplication, ResponseType } from '@snaphost/api';
import moment from 'moment';
import { HUMAN_DATE_TIME_FORMAT } from '../../utils';
import { IconInfoCircle, IconInfoCircleFilled, IconMessageCircle, IconPhoto, IconSettings, IconShield } from '@tabler/icons-react';
import ApplicationsManager from '../../components/applications/ApplicationsManager';
import { useAccount } from 'wagmi';


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



export default function EventsDetailsPage() {
    const params = useParams();
    const navigate = useNavigate();

    const { address, isConnected } = useAccount();

    const connection = rest('http://localhost:3030')
        .fetch(window.fetch.bind(window));
    const client = createClient(connection);

    const [event, setEvent] = React.useState<Event | null>(null);
    const [application, setApplication] = React.useState<EventApplication | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            const event = await client.service('events').get(params.id as string);

            setEvent(event);
        }

        fetchEvent();
    }, []);

    useEffect(() => {
        const fetchApplication = async () => {
            if (!isConnected || address === undefined) {
                setApplication(null);
                return;
            }

            const application = await client.service('event-applications').find({
                query: {
                    event_id: params.id,
                    owner: address
                }
            });
            
            console.log(application);

            if (application.total === 0) {
                setApplication(null);
            } else {
                setApplication(application.data[0]);
            }
        };

        fetchApplication();
    }, [address, isConnected]);

    const { classes } = useStyles();

    const applyButton = () => {
        if (application === null) {
            return (
                <Button 
                    fullWidth 
                    mt='lg' 
                    onClick={() => navigate(`/applications/create/${params.id}`)}
                >
                    Apply
                </Button>
            );
        } else {
            if (application.response === null) {
                return (
                    <Button
                        fullWidth
                        mt='lg'
                        disabled
                    >
                        Application is pending
                    </Button>
                );
            } else if (application.response.type === ResponseType.APPROVED) {
                return (
                    <Button
                        fullWidth
                        mt='lg'
                        color='green'
                    >
                        View ticket
                    </Button>
                );
            } else {
                return (
                    <Button
                        fullWidth
                        mt='lg'
                        disabled
                    >
                        Rejected
                    </Button>
                );
            }
        }
    };

    if (event === null || application == null) {
        return (
            <Center mih={700}>
                <Loader />
            </Center>
        );
    }

    return (
        <Container size='lg'>
            <Grid>
                <Grid.Col span={12} mb='sm'>
                    <Image height={300} src={event.image}/>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Tabs color="dark" defaultValue="about">
                        <Tabs.List>
                            <Tabs.Tab value="about" icon={<IconInfoCircle size="0.8rem" />}>
                                About
                            </Tabs.Tab>
                            
                            <Tabs.Tab value="settings" icon={<IconShield size="0.8rem" />}>
                                Requirements
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
                                        <Title order={5} className={classes.spec}>Organizer</Title>
                                        <Anchor fz='md' href='#'> { event.organizer ? event.organizer : `${event.owner.slice(0,7)}...${event.owner.slice(35)}` } </Anchor>

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
                                        <Group mt='xs'>
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

                        <Tabs.Panel value="settings" pt="xs">
                            Settings tab content
                        </Tabs.Panel>
                    </Tabs>
                </Grid.Col>
            </Grid>
        </Container>
    );
}