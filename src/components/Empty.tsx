import { Center, Group } from "@mantine/core";
import { IconShieldOff } from "@tabler/icons-react";
import React from "react";


export default function Empty({
    icon,
    text
}: {
    icon: React.ReactNode;
    text: string
}) {
    return (
        <Center mih={300}>
            <Group>
                { icon }

                { text }
            </Group>
        </Center>
    );
}