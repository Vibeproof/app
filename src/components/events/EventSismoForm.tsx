import React, { useEffect, useState } from "react";

import { Button, Card, Container, Grid, Group, Input, Title, Text, Divider, CloseButton, Pagination, TextInput, Center, Loader, Table, Avatar, Anchor, Stack } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";
// import sortBy from 'lodash/sortBy';


import {
    ClaimRequest,
    ClaimType,
    SismoConnectButton,
    SismoConnectResponse
} from "@sismo-core/sismo-connect-react";
import { useDebouncedState, useDebouncedValue, useWindowScroll } from "@mantine/hooks";
import { renderDataURI } from "@codingwithmanny/blockies";
import SismoGroupsTable from "../sismo/SismoGroupsTable";
import { SismoGroupData, getSismoGroups } from "../../utils/sismo";
import Loading from "../Loading";
import { EventFormData } from "./EventForm";
import { useNavigate } from "react-router-dom";
import { EventData, domain, eventTypes } from "@vibeproof/api";
import { client } from "../../utils/client";
import moment from "moment";
import { signTypedData } from "@wagmi/core";


export default function EventSismoForm({
    eventFormData,
    address,
} : {
    eventFormData: EventFormData,
    address: string
}) {
    const [sismoGroupsData, setSismoGroupsData] = useState<SismoGroupData[]>([]);
    const [choosenGroups, setChoosenGroups] = useState<SismoGroupData[]>([]);
    const [, scrollTo] = useWindowScroll();
    const navigate = useNavigate()

    const [submitting, setSubmitting] = React.useState<boolean>(false);

    useEffect(() => {
        scrollTo({ y: 0 });

        const fetchGroups = async () => {
            const groups = await getSismoGroups();

            const maintainedGroups = groups.filter((group: any) => {
                return group.tags.includes('Maintained');
            });        

            setSismoGroupsData(maintainedGroups);

            const gitCoinGroup = maintainedGroups.find((group) => group.id == '0x1cde61966decb8600dfd0749bd371f12');

            setChoosenGroups([gitCoinGroup]);
        }

        fetchGroups();
    }, []);

    const submit = async () => {
        const claims = choosenGroups.map((group) => {
            return {
                claimType: ClaimType.GTE,
                groupId: group.id,
                groupTimestamp: 'latest',
                value: 1,
                isOptional: false,
                isSelectableByUser: false,
                extraData: '',
            } as Required<ClaimRequest>;
        });

        const data: Omit<EventData, 'signature'> = {
            id: eventFormData.id,
            seed: eventFormData.seed,
            public: eventFormData.public,
            paused: eventFormData.paused,
            title: eventFormData.title,
            description: eventFormData.description,
            contacts: eventFormData.contacts,
            application_template: eventFormData.application_template,
            public_key: eventFormData.public_key,
            signature_public_key: eventFormData.signature_public_key,
            keystore: eventFormData.keystore,

            tags: eventFormData.tags,
            link: eventFormData.link,

            note: eventFormData.note,
            location: eventFormData.location,
            capacity: eventFormData.capacity,
            price: eventFormData.price,

            sismo: {
                auths: [],
                // @ts-ignore
                claims: claims,
            },

            registration_start: eventFormData.registration_start,
            registration_end: eventFormData.registration_end,
            start: eventFormData.start,
            end: eventFormData.end,

            timestamp: moment().toISOString(),
            owner: address,
            version: 0
        };

        const signature = await signTypedData({
            domain,
            message: {
                ...data,
            },
            primaryType: 'Event',
            types: eventTypes
        });

        const event = await client.service('events').create({
            ...data,
            signature
        });
        
        navigate(`/events/${event.id}`);
    }

    if (sismoGroupsData.length === 0) {
        return <Loading />;
    }

    return (
        <Container>
            <Grid>
                <Grid.Col>
                    <div>
                        <Text fw={500}>
                            You've choosen { choosenGroups.length } groups
                        </Text>
                        <Text c='dimmed'>
                            You can gate your event to a specific group of people (example: group of all ENS owners). To attend your event, the guest will need to zk prove that they are part of the group.
                        </Text>
                        <Anchor href='https://docs.sismo.io/sismo-docs/data-groups/data-groups-and-creation' target="_blank">Learn more about groups in Sismo docs</Anchor>
                        <Text c='dimmed'>
                            If no groups are selected, anyone can register to your event.
                        </Text>
                        <Text c='dimmed'>
                            If multiple groups are selected, the applicant must prove that they are part of at least one of them.
                        </Text>

                        <br/>
                        <Text c='dimmed'>
                            By default, the Gitcoin passport holders group is selected. Read mode about Gitcoin passport <Anchor href="https://docs.passport.gitcoin.co/" target="_blank">here</Anchor>.
                        </Text>
                    </div>
                </Grid.Col>

                <Grid.Col>
                    <SismoGroupsTable
                        pagination={true}
                        selectable={true}
                        groups={sismoGroupsData}
                        choosenGroups={choosenGroups}
                        setChoosenGroups={setChoosenGroups}
                    />
                </Grid.Col>

                <Grid.Col>
                    <Center>
                        <Button loading={submitting} size="md" onClick={() => {
                            setSubmitting(true);

                            submit()
                                .catch(e => {
                                    setSubmitting(false);
                                })
                                .then(() => {
                                    setSubmitting(false);
                                })
                        }}>
                            Publish
                        </Button>
                    </Center>
                </Grid.Col>
            </Grid>
        </Container>
    );
}