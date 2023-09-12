import React, { useEffect, useState } from "react";

import { Container, Grid, Stepper, Text } from "@mantine/core";
import { useAccount } from "wagmi";
import ConnectWallet from "../../components/ConnectWallet";
import EventForm from "../../components/events/EventForm";
import { IconCircle, IconCircleCheck, IconFileDescription, IconFileText, IconShield, IconWallet } from "@tabler/icons-react";

import { EventFormData } from "../../components/events/EventForm";
import EventSismoForm from "../../components/events/EventSismoForm";
import { ClaimRequest } from "@sismo-core/sismo-connect-react";
import EventSubmit from "../../components/events/EventSubmit";

enum EventCreationSteps {
    CONNECT_WALLET,
    FILL_DETAILS,
    SET_REQUIREMENTS,
    DONE,
}


export default function EventsCreatePage() {
    const { address, isConnected } = useAccount();
    const [step, setStep] = useState<EventCreationSteps>(EventCreationSteps.CONNECT_WALLET);
    const [eventFormData, setEventFormData] =useState<EventFormData | null>(null);
    const [claims, setClaims] = useState<ClaimRequest[]>([]);

    useEffect(() => {
        if (isConnected === false) {
            setStep(EventCreationSteps.CONNECT_WALLET);
        } else {
            setStep(EventCreationSteps.FILL_DETAILS);
        }
    }, [address]);

    const setEventFormDataCallback = (data: EventFormData) => {
        setEventFormData(data);
        setStep(EventCreationSteps.SET_REQUIREMENTS);
    }

    const setClaimsCallback = (claims: ClaimRequest[]) => {
        setClaims(claims);
        setStep(EventCreationSteps.DONE);
    };

    const stepIcon = (step: EventCreationSteps) => {
        const size = 20;

        switch (step) {
            case EventCreationSteps.CONNECT_WALLET:
                return <IconWallet size={size} />;
            case EventCreationSteps.FILL_DETAILS:
                return <IconFileText size={size} />;
            case EventCreationSteps.SET_REQUIREMENTS:
                return <IconShield size={size} />;
            case EventCreationSteps.DONE:
                return <IconCircleCheck size={size} />;
            default:
                return <IconCircle size={size} />;
        }
    }

    return (
        <Container size='lg' pt={50}>
            <Grid>
                <Grid.Col span={3}>
                    <Stepper active={step} orientation="vertical" completedIcon={stepIcon(EventCreationSteps.CONNECT_WALLET)}>
                        <Stepper.Step
                            icon={stepIcon(EventCreationSteps.CONNECT_WALLET)}
                            label="Step 1"
                            description="Connect wallet"
                        />
                        <Stepper.Step 
                            icon={stepIcon(EventCreationSteps.FILL_DETAILS)}
                            label="Step 2"
                            description="Fill the details"
                        />
                        <Stepper.Step 
                            icon={stepIcon(EventCreationSteps.SET_REQUIREMENTS)}
                            label="Step 4"
                            description="Set up requirements"
                        />
                        <Stepper.Step 
                            icon={stepIcon(EventCreationSteps.DONE)}
                            label="Step 5"
                            description="Submit event"
                        />
                    </Stepper>
                </Grid.Col>

                <Grid.Col span={9}>
                    {
                        step === EventCreationSteps.CONNECT_WALLET 
                        && <ConnectWallet/> 
                    }

                    {
                        step === EventCreationSteps.FILL_DETAILS
                        && <EventForm 
                            address={address as string}
                            setEventFormData={setEventFormDataCallback}
                        />
                    }

                    {
                        step === EventCreationSteps.SET_REQUIREMENTS
                        && <EventSismoForm 
                            setClaims={setClaimsCallback}
                        />
                    }

                    {
                        step === EventCreationSteps.DONE
                        && eventFormData !== null
                        && <EventSubmit 
                            eventFormData={eventFormData}
                            claims={claims}
                            address={address as string}
                        />
                    }
                </Grid.Col>
            </Grid>
        </Container>
    );
}