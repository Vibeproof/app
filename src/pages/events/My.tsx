import React, { useEffect } from "react";
import { useAccount } from "wagmi";

import rest from '@feathersjs/rest-client';
import { createClient, Event, EventApplication, ResponseType } from '@vibeproof/api';
import { ActionIcon, Anchor, Badge, Button, Container, rem, Table } from "@mantine/core";
import ConnectWallet from "../../components/ConnectWallet";
import moment from "moment";
import { HUMAN_DATE_TIME_FORMAT } from "../../utils";
import { Link, useNavigate } from "react-router-dom";
import { client } from "../../utils/client";
import Loading from "../../components/Loading";
import Empty from "../../components/Empty";
import { IconCalendarCancel, IconEdit, IconPencil } from "@tabler/icons-react";


export default function EventsMyPage() {
    const { address, isConnected } = useAccount();
    const navigate = useNavigate();

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
                    <ActionIcon variant="subtle" color="gray" onClick={(e) => {
                        navigate(`/events/edit/${event.id}`);
                    }}>
                        <IconPencil style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    </ActionIcon>
                </td>
            </tr>
        )
    });

    return (
        <Container size='lg' pt={50}>
            <Table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Created at</th>
                        <th>Applications</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    { eventRows }
                </tbody>
            </Table>
        </Container>
    );
}