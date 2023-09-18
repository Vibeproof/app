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
import { useDebouncedState, useDebouncedValue } from "@mantine/hooks";
import { renderDataURI } from "@codingwithmanny/blockies";
import SismoGroupsTable from "../sismo/SismoGroupsTable";
import { SismoGroupData, getSismoGroups } from "../../utils/sismo";
import Loading from "../Loading";


export default function EventSismoForm({
    setClaims
} : {
    setClaims: (groups: ClaimRequest[]) => void
}) {
    const [sismoGroupsData, setSismoGroupsData] = useState<SismoGroupData[]>([]);
    const [choosenGroups, setChoosenGroups] = useState<SismoGroupData[]>([]);
      
    useEffect(() => {
        const fetchGroups = async () => {
            const groups = await getSismoGroups();

            setSismoGroupsData(groups);
        }

        fetchGroups();
    }, []);

    const submit = () => {
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

        setClaims(claims);
    }

    if (sismoGroupsData.length === 0) {
        return <Loading />;
    }

    return (
        <Container>
            <Grid>
                <Grid.Col>
                    <Group position="apart">
                        <div>
                            <Text fw={500}>
                                You've choosen { choosenGroups.length } groups
                            </Text>
                            <Text c='dimmed'>
                                If not groups choosen - anyone can apply to your event. 
                            </Text>
                            <Text c='dimmed'>
                                If multisple groups choosen - applicant should proof that he is a member of one of them.
                            </Text>
                        </div>

                        <Button size="xs" onClick={() => submit()}>
                            Continue
                        </Button>
                    </Group>
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
            </Grid>
        </Container>
    );
}