import React, { useEffect } from "react";


import { Container, Grid, Pagination } from "@mantine/core";
import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event } from '@vibeproof/api';
import EventCard from "../../components/events/EventCard";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import InfiniteScroll from "react-infinite-scroll-component";
import { client } from "../../utils/client";


export default function EventsSearchPage() {
    const navigate = useNavigate();

    const [events, setEvents] = React.useState<Event[] | null>(null);
    const [totalEvents, setTotalEvents] = React.useState<number | null>(null);

    const fetchTotalEvents = async () => {
        const {
            total
        } = await client.service('events').find({
            query: {
                $limit: 0
            }
        });

        setTotalEvents(total);
    }

    const fetchEvents = async () => {
        const events_ = await client.service('events').find({
            query: {
                banned: false,
                public: true,
                $skip: events === null ? 0 : events.length,
                $limit: 9,
                $sort: {
                    'timestamp': -1,
                }
            }
        });

        if (events === null) {
            setEvents(events_.data);
        } else {
            setEvents([...events, ...events_.data]);
        }
    }

    useEffect(() => {
        fetchEvents();
        fetchTotalEvents();
    }, []);

    if (events === null || totalEvents === null) {
        return <Loading/>;
    }

    const eventComponents = events?.map((event, i) => {
        return (
            <Grid.Col md={6} sm={12} key={i} lg={4}>
                <EventCard event={event} onClick={(event: Event) => {
                    navigate(`/events/${event.id}`);
                }}/>
            </Grid.Col>
        );
    });

    return (
        <Container size='lg' pt={50}>
            <InfiniteScroll
                dataLength={events.length}
                next={() => fetchEvents()}
                hasMore={events.length < totalEvents}
                loader={<Loading/>}
                scrollThreshold={0.9}
                style={{ height: '100%', overflow: 'hidden' }}
            >
                <Grid align="stretch">
                    { eventComponents }
                </Grid>
            </InfiniteScroll>
        </Container>
    );
}