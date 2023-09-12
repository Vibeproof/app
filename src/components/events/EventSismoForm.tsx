import React, { useEffect, useState } from "react";

import { Button, Card, Container, Grid, Group, Input, Title, Text, Divider, CloseButton, Pagination, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";


import {
    ClaimRequest,
    ClaimType,
    SismoConnectButton,
    SismoConnectResponse
} from "@sismo-core/sismo-connect-react";
import SismoGroupCard, { SismoGroupData } from "../sismo/SismoGroupCard";
import { useDebouncedState } from "@mantine/hooks";


const favoriteGroups = [
    '0xd630aa769278cacde879c5c0fe5d203c',
    '0xff7653240feecd7448150005a95ac86b',
    '0x42c768bb8ae79e4c5c05d3b51a4ec74a',
    '0x1cde61966decb8600dfd0749bd371f12',
    '0x0f800ff28a426924cbe66b67b9f837e2',
    '0xab882512e97b60cb2295a1c190c47569',
];


export default function EventSismoForm({
    setClaims
} : {
    setClaims: (groups: ClaimRequest[]) => void
}) {
    const [sismoGroupsData, setSismoGroupsData] = useState<SismoGroupData[]>([]);
    const [choosenGroups, setChoosenGroups] = useState<SismoGroupData[]>([]);
    const [filter, setFilter] = useState<string>('');

    useEffect(() => {
        axios.get('https://hub.sismo.io/groups/latests').then((response) => {
            const groups = response.data.items.map((group: any) => {
                return {
                    ...group,
                    title: group.name.replaceAll('-', ' ')
                };
            });

            console.log(groups[0]);

            const favoriteGroupsFirst = [
                ...groups.filter((group: any) => favoriteGroups.includes(group.id)),
                ...groups.filter((group: any) => !favoriteGroups.includes(group.id))
            ];

            setSismoGroupsData(favoriteGroupsFirst);
        });
    }, []);

    const addGroupCallback = (group: any) => {
        setChoosenGroups([
            ...choosenGroups,
            group
        ]);
    }

    const removeGroupCallback = (i: number) => {
        setChoosenGroups(choosenGroups.filter((_, index) => index !== i));
    }

    const sismoGroupsCards = sismoGroupsData
        .filter((group) => {
            return (
                group.title.toLowerCase().includes(filter.toLowerCase())
                || group.description?.toLowerCase().includes(filter.toLowerCase()) 
            ) && (!choosenGroups.includes(group));
        })
        .map((group, i) => {
            return (
                <Grid.Col key={i} span={12}>
                    <SismoGroupCard 
                        key={i}
                        group={group}
                        addGroup={addGroupCallback}
                        isAddDisabled={choosenGroups.length === 5}
                    />
                </Grid.Col>
            );
        });

    const chosenGroupComponents = choosenGroups.map((group, i) => {
        return (
            <div key={i}>
                <Group position="apart">
                    <Text fz="lg" style={{ textTransform: 'capitalize' }}>
                        { group.title }
                    </Text>

                    <CloseButton aria-label="Close modal" onClick={() => removeGroupCallback(i)}/>
                </Group>
                <Divider mt="xs" mb="xs"/>
            </div>
        );
    });

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

    return (
        <Container>
            <Grid>
                <Grid.Col span={12}>
                    <TextInput
                        icon={<IconSearch />}
                        placeholder="Search groups by name or description"
                        onChange={(event) => { setFilter(event.currentTarget.value); }}
                    />
                </Grid.Col>

                <Grid.Col span={7}>
                    <Grid>
                        { sismoGroupsCards }
                    </Grid>
                </Grid.Col>

                <Grid.Col span={5}>
                    <Card withBorder>
                        <Title order={4} mb='md'>
                            You've choosen { choosenGroups.length } groups
                        </Title>

                        { chosenGroupComponents }

                        <Button fullWidth mt='md' onClick={() => submit()}>
                            Continue
                        </Button>
                    </Card>
                </Grid.Col>
            </Grid>
        </Container>
    );
}