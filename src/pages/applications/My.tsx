import React, { useEffect } from "react";

import rest from '@feathersjs/rest-client';
import { createClient, EventApplication, ResponseType } from '@vibeproof/api';
import { useAccount } from "wagmi";
import ConnectWallet from "../../components/ConnectWallet";
import { Anchor, Badge, Container, Table } from "@mantine/core";
import moment from "moment";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import Empty from "../../components/Empty";
import { IconTicketOff } from "@tabler/icons-react";
import { getApplicationBadge } from "../../utils/applications";
import { client } from "../../utils/client";


export default function ApplicationsMyPage() {
    const { address, isConnected } = useAccount();

    const [eventApplications, setEventApplications] = React.useState<EventApplication[] | null>(null);

    useEffect(() => {
        if (!isConnected) return;

        const fetchEventApplications = async () => {
            const eventApplications = await client.service('event-applications').find({
                query: {
                    owner: address as string,
                    $sort: {
                        'timestamp': -1
                    }
                }
            });

            console.log(eventApplications);

            setEventApplications(eventApplications.data);
        }

        fetchEventApplications();
    }, [address]);

    const eventApplicationRows = eventApplications?.map((eventApplication: EventApplication, i) => {
        return (
            <tr key={i}>
                <td>{ <Anchor component={Link} to={`/events/${eventApplication.event.id}`}>{ eventApplication.event.title }</Anchor> }</td>
                <td>{ getApplicationBadge(eventApplication) }</td>
                <td>{ moment(eventApplication.timestamp).fromNow() }</td>
                <td>{ `${eventApplication.cid.slice(0, 20)}...`  }</td>
            </tr>
        )
    });

    if (!isConnected) return (
        <ConnectWallet />
    )

    if (eventApplications == null) {
        return <Loading />
    }

    if (eventApplications.length === 0) {
        return <Empty
            icon={<IconTicketOff size={28} />}
            text='You have no invites'
        />
    }

    return (
        <Container size='lg' pt={50}>
            <Table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Status</th>
                        <th>Submission</th>
                        <th>IPFS</th>
                    </tr>
                </thead>
                <tbody>
                    { eventApplicationRows }
                </tbody>
            </Table>
        </Container>
    )
}