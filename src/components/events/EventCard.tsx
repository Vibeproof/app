import React from "react";

import { Event } from '@vibeproof/api';
import { ActionIcon, Badge, Button, Card, Group, Image, Text, createStyles, rem } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { Link } from "react-router-dom";


const useStyles = createStyles((theme) => ({
    card: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        ":hover": {
            cursor: 'pointer'
        }
    },

    section: {
        // borderBottom: `${rem(1)} solid ${
        //     theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
        // }`,
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        paddingBottom: theme.spacing.xs,
    },

    description: {
        whiteSpace: 'pre-wrap'
    },

    like: {
        // color: theme.colors.red[6],
    },

    label: {
        textTransform: 'uppercase',
        fontSize: theme.fontSizes.xs,
        fontWeight: 700,
    },
    button: {
    }
}));
  

export default function EventCard({
    event,
    onClick
}: {
    event: Event,
    onClick: (event: Event) => void
}) {
    const { classes, theme } = useStyles();

    const tags = event.tags.map((tag, i) => (
        <Badge
          color={theme.colors.violet[3]}
          key={i}
        >
          {tag}
        </Badge>
    ));
    
    return (
        <Card shadow="sm" radius="md" withBorder className={classes.card} onClick={() => onClick(event)}>
            <Card.Section>
                <Image
                    src={event.image.src}
                    height={160}
                    alt="Norway"
                />
            </Card.Section>

            <Card.Section className={classes.section} mt="md">
                <Text fz="lg" fw={500} lineClamp={2}>
                    {event.title}
                </Text>
 
                <Text fz="sm" mt="xs" lineClamp={6} className={classes.description}>
                   {event.description}
                </Text>
            </Card.Section>

            <Card.Section className={classes.section}>
                <Group spacing={7} my={5}>
                    { tags }
                </Group>
            </Card.Section>

            <Group>
                <Button className={classes.button} radius="md" style={{ flex: 1 }} onClick={() => onClick(event)}>
                    Show details
                </Button>
            </Group>
        </Card>
    );
}