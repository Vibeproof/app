import React, { useEffect } from "react";
import { useAccount } from "wagmi";

import rest from '@feathersjs/rest-client';
import { createClient, Event, EventApplication, ResponseType } from '@vibeproof/api';
import { Anchor, Badge, Button, Container, Table } from "@mantine/core";
import ConnectWallet from "../../components/ConnectWallet";
import moment from "moment";
import { HUMAN_DATE_TIME_FORMAT } from "../../utils";
import { Link } from "react-router-dom";
import { client } from "../../utils/client";
import Loading from "../../components/Loading";
import Empty from "../../components/Empty";
import { IconCalendarCancel, IconEdit } from "@tabler/icons-react";


export default function EventsMyPage() {
    const { address, isConnected } = useAccount();

    const [events, setEvents] = React.useState<Event[] | null>(null);

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

    if (events == null) return (
        <Loading />
    );

    if (events.length == 0) return (
        <Empty
            icon={<IconCalendarCancel size={28} />}
            text="You haven't created any events yet."
        />
    );

    const eventRows = events?.map((event: Event, i) => {
        return (
            <tr key={i}>
                <td>{ <Anchor component={Link} to={`/events/${event.id}`}>{ event.title }</Anchor> }</td>
                <td>{ moment(event.timestamp).format(HUMAN_DATE_TIME_FORMAT) }</td>
                <td>{ event.applications }</td>
                <td>
                    <Link to={`/events/edit/${event.id}`}>
                        <IconEdit size={18} />
                    </Link>
                </td>
            </tr>
        )
    });

    return (
        <Container size='lg' pt={50}>
            <Table highlightOnHover>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Created at</th>
                        <th>Applications</th>
                        <th>Edit</th>
                    </tr>
                </thead>
                <tbody>
                    { eventRows }
                </tbody>
            </Table>
        </Container>
    );
}