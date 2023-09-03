import { Button, Card, Group, Text, Title, createStyles, rem } from "@mantine/core";
import React from "react";

export type SismoGroupData = {
    id: string;
    title: string;
    dataUrl: string;
    name: string;
    description: string | null;
    properties: {
        accountsNumber: number;
    };
    specs: string;
    tags: string[];
    timestamp: number;
}


const useStyles = createStyles((theme) => ({
    card: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    },
  
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        borderTop: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
        }`,
    },

    title: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        lineHeight: 1,
    },
}));
  


export default function SismoGroupCard({
    group,
    addGroup = () => {},
    isAddDisabled = false,
} : {
    group: SismoGroupData;
    addGroup?: (group: SismoGroupData) => void;
    isAddDisabled?: boolean;
}) {
    const { classes } = useStyles();

    return (
        <Card withBorder>
            <Group position="apart">
                <Title order={3} style={{ textTransform: 'capitalize' }}>
                    { group.title }
                </Title>

                <Button 
                    size="xs"
                    onClick={() => {
                        addGroup(group);
                    }}
                    disabled={isAddDisabled}
                >
                    Add
                </Button>
            </Group>

            <Title order={6} color="dimmed">
                { group.description }
            </Title>

            <Text pt='md'>
                { group.specs }
            </Text>

            <Card.Section className={classes.footer} mt='md'>
                <Group position="apart">
                    <div>
                        <Text size="xs" color="dimmed">
                            Members
                        </Text>
                        <Text weight={500} size="sm">
                            {group.properties.accountsNumber}
                        </Text>
                    </div>
                </Group>
            </Card.Section>
        </Card>
    );
}