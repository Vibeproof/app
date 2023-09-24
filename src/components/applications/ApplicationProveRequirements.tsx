import React, { useEffect, useState } from "react";

import { Event } from "@vibeproof/api";
import { Card, CloseButton, Container, Divider, Grid, Group, Title, Text, Button, Switch, createStyles, rem, Center } from "@mantine/core";
import axios from "axios";
import { SismoConnectButton, SismoConnectConfig, SismoConnectResponse } from "@sismo-core/sismo-connect-react";
import { SismoGroupData, getSismoGroups } from "../../utils/sismo";
import Loading from "../Loading";
import SismoGroupsTable from "../sismo/SismoGroupsTable";
  

export default function ApplicationProveRequirements({
    event,
    setSismoResponse
}: {
    event: Event,
    setSismoResponse: (response: SismoConnectResponse) => void
}) {
    const [groups, setGroups] = React.useState<SismoGroupData[] | null>(null);
    const [choosenGroups, setChoosenGroups] = useState<SismoGroupData[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            const groups = await getSismoGroups();

            const eventGroups = event.sismo.claims.map((claim) => claim.groupId);
            
            setGroups(groups.filter((group: SismoGroupData) => eventGroups.includes(group.id)));
        }

        fetchGroups();
    }, []);

    const sismoConfig: SismoConnectConfig = {
        appId: '0x87e85da6085ed10602ede76bada27c7b'
    }

    const claims = event.sismo.claims.filter((claim) => {
        return choosenGroups.map((group) => group.id).includes(claim.groupId);
    });

    if (groups === null) {
        return <Loading />;
    }

    const prove = async () => {

    }

    return (
        <Container>
            <Grid>
            <Grid.Col>
                    <Group position="apart">
                        <div>
                            <Text fw={500}>
                                You've selected { choosenGroups.length } groups
                            </Text>
                        </div>

                        {/* <Button size="xs" onClick={() => prove()}>
                            Prove
                        </Button> */}
                        <SismoConnectButton
                            config={sismoConfig}
                            disabled={choosenGroups.length === 0}
                            // @ts-ignore
                            claims={claims}
                            text="Prove"
                            overrideStyle={{ height: rem(35) }}
                            onResponse={(response: SismoConnectResponse) => {
                                setSismoResponse(response);
                            }}
                        />
                    </Group>
                </Grid.Col>

                <Grid.Col span={12}>
                    <SismoGroupsTable
                        selectable={true}
                        choosenGroups={choosenGroups}
                        setChoosenGroups={setChoosenGroups}
                        groups={groups}
                    />
                </Grid.Col>
            </Grid>
        </Container>
    );
}