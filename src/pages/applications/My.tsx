import React, { useEffect } from "react";

import rest from '@feathersjs/rest-client';
import { createClient, EventApplication, ResponseType } from '@snaphost/api';
import { useAccount } from "wagmi";
import ConnectWallet from "../../components/ConnectWallet";
import { Anchor, Badge, Container, Table } from "@mantine/core";
import moment from "moment";
import { Link } from "react-router-dom";


export default function ApplicationsMyPage() {
    const { address, isConnected } = useAccount();

    const connection = rest('http://localhost:3030')
        .fetch(window.fetch.bind(window));
    const client = createClient(connection);

    const [eventApplications, setEventApplications] = React.useState<EventApplication[]>([]);

    useEffect(() => {
        if (!isConnected) return;

        const fetchEventApplications = async () => {
            const eventApplications = await client.service('event-applications').find({
                query: {
                    owner: address as string,
                }
            });

            console.log(eventApplications);

            setEventApplications(eventApplications.data);
        }

        fetchEventApplications();
    }, [address]);

    const getApplicationBadge = (eventApplication: EventApplication) => {
        if (eventApplication.response == null) {
            return <Badge c='gray'>Pending</Badge>
        } else if (eventApplication.response.type === ResponseType.APPROVED) {
            return <Badge c='green'>Approved</Badge>
        } else {
            return <Badge c='red'>Rejected</Badge>
        }
    }

    const eventApplicationRows = eventApplications.map((eventApplication: EventApplication, i) => {
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
    );

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