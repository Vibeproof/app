import { Center, Container, Text, Title } from "@mantine/core";
import { IconWallet } from "@tabler/icons-react";
import React from "react";


export default function ConnectWallet() {
    return (
        <Center h={500}>
            <Container>
                <Title>Connect your wallet</Title>
                {/* <Text>
                    For event creation you need to use wallet with ENS address. 
                    If you don't have one, you can purchase it on <a href="https://app.ens.domains/" target="blank">ENS app</a>.
                    <br />
                    Currently, single ENS address can be used to create up to 5 events.
                    <br />
                    Event creation happens offchain, you don't need to send transactions or pay gas fees.
                </Text> */}
           </Container>
        </Center>
    );
}