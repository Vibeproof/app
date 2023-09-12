import React, { useEffect } from "react";
import { useAccount } from "wagmi";

import rest from '@feathersjs/rest-client';
import { createClient, Event, EventApplication, ResponseType } from '@snaphost/api';
import { Anchor, Badge, Container, Table } from "@mantine/core";
import ConnectWallet from "../../components/ConnectWallet";
import moment from "moment";
import { HUMAN_DATE_TIME_FORMAT } from "../../utils";
import { Link } from "react-router-dom";


export default function EventsMyPage() {
    const { address, isConnected } = useAccount();

    const connection = rest('http://localhost:3030')
        .fetch(window.fetch.bind(window));
    const client = createClient(connection);

    const [events, setEvents] = React.useState<Event[]>([]);

    useEffect(() => {
        if (!isConnected) return;

        const fetchEvents = async () => {
            const events = await client.service('events').find({
                query: {
                    owner: address as string,
                }
            });

            setEvents(events.data);
        }

        fetchEvents();
    }, [address]);

    if (!isConnected) return (
        <ConnectWallet />
    );

    const eventRows = events.map((event: Event, i) => {
        return (
            <tr key={i}>
                <td>{ <Anchor component={Link} to={`/events/${event.id}`}>{ event.title }</Anchor> }</td>
                <td>{ moment(event.timestamp).format(HUMAN_DATE_TIME_FORMAT) }</td>
                <td>{ event.applications }</td>
                <td>{ `${event.cid.slice(0, 20)}...`  }</td>
            </tr>
        )
    });

    return (
        <Container size='lg' pt={50}>
            <Table striped highlightOnHover>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Created at</th>
                        <th>Applications</th>
                        <th>IPFS</th>
                    </tr>
                </thead>
                <tbody>
                    { eventRows }
                </tbody>
            </Table>
        </Container>
    );
}