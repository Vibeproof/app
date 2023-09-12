import { Center, Container, Text, Title } from "@mantine/core";
import React from "react";


export default function ConnectWallet() {
    return (
        <Center h={500}>
            <Container>
                <Title>Connect wallet with ENS address</Title>
                <Text>To create an event you should connect wallet with ENS address</Text>
                <Text>If you don't have one, you can purchase it in ENS app</Text>
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