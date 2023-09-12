import React, { useEffect } from "react";


import { Container, Grid } from "@mantine/core";
import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event } from '@snaphost/api';
import EventCard from "../../components/events/EventCard";
import { useNavigate } from "react-router-dom";


export default function EventsSearchPage() {
    const navigate = useNavigate();

    const connection = rest('http://localhost:3030')
        .fetch(window.fetch.bind(window));

    const client = createClient(connection);

    const [events, setEvents] = React.useState<Event[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const events = await client.service('events').find({
                query: {
                    $sort: {
                        'timestamp': -1
                    }
                }
            });

            setEvents(events.data);
        }

        fetchEvents();
    }, []);

    const eventComponents = events.map((event, i) => {
        return (
            <Grid.Col key={i} span={4}>
                <EventCard event={event} onClick={(event: Event) => {
                    navigate(`/events/${event.id}`);
                }}/>
            </Grid.Col>
        );
    });

    return (
        <Container size='lg' pt={50}>
            <Grid>
                {eventComponents}
            </Grid>
        </Container>
    )
}