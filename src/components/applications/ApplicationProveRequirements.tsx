import React, { useEffect, useState } from "react";

import { Event } from "@snaphost/api";
import { Card, CloseButton, Container, Divider, Grid, Group, Title, Text, Button, Switch, createStyles, rem, Center } from "@mantine/core";
import SismoGroupCard, { SismoGroupData } from "../sismo/SismoGroupCard";
import axios from "axios";
import { SismoConnectButton, SismoConnectConfig, SismoConnectResponse } from "@sismo-core/sismo-connect-react";


const useStyles = createStyles((theme) => ({
    card: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    },
  
    item: {
      '& + &': {
        paddingTop: theme.spacing.sm,
        marginTop: theme.spacing.sm,
        borderTop: `${rem(1)} solid ${
          theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
      },
    },
  
    switch: {
      '& *': {
        cursor: 'pointer',
      },
    },
  
    title: {
      lineHeight: 1,
    },
}));
  

export default function ApplicationProveRequirements({
    event,
    setSismoResponse
}: {
    event: Event,
    setSismoResponse: (response: SismoConnectResponse) => void
}) {
    const { classes } = useStyles();

    const [sismoGroupsData, setSismoGroupsData] = useState<SismoGroupData[]>([]);
    const [choosenGroups, setChoosenGroups] = useState<SismoGroupData[]>([]);

    const addGroupCallback = (group: any) => {
        setChoosenGroups([
            ...choosenGroups,
            group
        ]);
    }

    const removeGroupCallback = (i: number) => {
        setChoosenGroups(choosenGroups.filter((_, index) => index !== i));
    }

    useEffect(() => {
        axios.get('https://hub.sismo.io/groups/latests').then((response) => {
            const groups = response.data.items.map((group: any) => {
                return {
                    ...group,
                    title: group.name.replaceAll('-', ' ')
                };
            });

            const groupIds = event.sismo.claims.map((application) => application.groupId);

            const applicationGroups = groups.filter((group: SismoGroupData) => groupIds.includes(group.id));

            console.log(applicationGroups);

            setSismoGroupsData(applicationGroups);
        });
    }, []);

    const sismoGroupsItems = sismoGroupsData
        .map((group, i) => {
            return (
                <Group position="apart" noWrap spacing="xl" key={i} className={classes.item}>
                    <div>
                        <Text>{group.title}</Text>

                        <Text size="xs" color="dimmed">
                            {group.description}
                        </Text>
                    </div>

                    <Switch onLabel="ON" offLabel="OFF" size="lg" className={classes.switch} onChange={(e) => {
                        const checked = e.currentTarget.checked;

                        if (checked) {
                            addGroupCallback(group);
                        } else {
                            removeGroupCallback(i);
                        }
                    }} />
                </Group>
            );
        });

    const sismoConfig: SismoConnectConfig = {
        appId: '0x87e85da6085ed10602ede76bada27c7b'
    }

    const claims = event.sismo.claims.filter((claim) => {
        return choosenGroups.map((group) => group.id).includes(claim.groupId);
    });

    return (
        <Container>
            <Card withBorder radius="md" p="xl" className={classes.card}>
                <Text fz="lg" fw={500} className={classes.title}>
                    You've choosen { choosenGroups.length } groups
                </Text>
                <Text fz="xs" c="dimmed" mt={3} mb="xl">
                    Choose at least 1 group to apply for the event
                </Text>

                { sismoGroupsItems }

                <Card.Section pt='md'>
                    <SismoConnectButton 
                        config={sismoConfig}
                        auths={[]}
                        // @ts-ignore
                        claims={claims}
                        disabled={choosenGroups.length === 0}
                        text="Prove"
                        overrideStyle={{ width: '100%' }}
                        onResponse={(response: SismoConnectResponse) => {
                            setSismoResponse(response);
                        }}
                    />
                </Card.Section>

            </Card>
        </Container>
    );
}