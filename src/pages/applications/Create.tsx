import React, { useEffect, useState } from "react";

import { Center, Container, Grid, Loader, Stepper } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { IconCircle, IconCircleCheck, IconEyeCheck, IconFileText, IconWallet } from "@tabler/icons-react";

import rest from '@feathersjs/rest-client';
import { ClientApplication, createClient, Event, EventApplication } from '@vibeproof/api';
import ConnectWallet from "../../components/ConnectWallet";
import ApplicationForm, { ApplicationFormData } from "../../components/applications/ApplicationForm";
import ApplicationProveRequirements from "../../components/applications/ApplicationProveRequirements";
import { SismoConnectResponse } from "@sismo-core/sismo-connect-react";
import Loading from "../../components/Loading";
import { client } from "../../utils/client";


enum ApplicationCreationSteps {
    CONNECT_WALLET,
    PROVE_REQUIREMENTS,
    FILL_DETAILS,
}


export default function ApplicationsCreatePage() {
    const params = useParams();
    const { address, isConnected } = useAccount();

    const [step, setStep] = useState<ApplicationCreationSteps>(ApplicationCreationSteps.CONNECT_WALLET);
    const [event, setEvent] = React.useState<Event | null>(null);
    const [applicationFormData, setApplicationFormData] = useState<ApplicationFormData | null>(null);
    const [sismoResponse, setSismoResponse] = useState<SismoConnectResponse | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            const event = await client.service('events').get(params.id as string);

            setEvent(event);
        }

        fetchEvent();
    }, []);

    useEffect(() => {
        if (isConnected === false) {
            setStep(ApplicationCreationSteps.CONNECT_WALLET);
        } else {
            if (event !== null) {
                if (event.sismo.claims.length === 0) {
                    setStep(ApplicationCreationSteps.FILL_DETAILS);
                } else {
                    setStep(ApplicationCreationSteps.PROVE_REQUIREMENTS);
                }
            }
        }
    }, [address, event]);

    const stepIcon = (step: ApplicationCreationSteps) => {
        const size = 20;

        switch (step) {
            case ApplicationCreationSteps.CONNECT_WALLET:
                return <IconWallet size={size} />;
            case ApplicationCreationSteps.FILL_DETAILS:
                return <IconFileText size={size} />;
            case ApplicationCreationSteps.PROVE_REQUIREMENTS:
                return <IconEyeCheck size={size} />;
            default:
                return <IconCircle size={size} />;
        }
    }

    if (event === null) {
        return (
            <Center mih={700}>
                <Loader />
            </Center>
        );
    }

    const setSismoResponseCallback = (response: SismoConnectResponse) => {
        setSismoResponse(response);
        setStep(ApplicationCreationSteps.FILL_DETAILS);
    }

    if (event === null) {
        return <Loading />;
    }


    return (
        <Container size='lg' pt={50}>
            <Grid>
                <Grid.Col span={3}>
                    <Stepper active={step} orientation="vertical">
                        <Stepper.Step
                            icon={stepIcon(ApplicationCreationSteps.CONNECT_WALLET)}
                            label="Step 1"
                            description="Connect wallet"
                        />
                        <Stepper.Step 
                            icon={stepIcon(ApplicationCreationSteps.PROVE_REQUIREMENTS)}
                            label="Step 2"
                            description="Prove requirements"
                        />
                        <Stepper.Step 
                            icon={stepIcon(ApplicationCreationSteps.FILL_DETAILS)}
                            label="Step 3"
                            description="Fill the details"
                        />
                    </Stepper>
                </Grid.Col>

                <Grid.Col span={9}>
                    {
                        step === ApplicationCreationSteps.CONNECT_WALLET && 
                        <ConnectWallet />
                    }

                    {
                        step === ApplicationCreationSteps.PROVE_REQUIREMENTS &&
                        <ApplicationProveRequirements 
                            event={event}
                            setSismoResponse={setSismoResponseCallback}
                        />
                    }

                    {
                        step === ApplicationCreationSteps.FILL_DETAILS &&
                        <ApplicationForm 
                            event={event}
                            address={address as string}
                            sismoResponse={sismoResponse as SismoConnectResponse}
                        />
                    }
                </Grid.Col>
            </Grid>
        </Container>
    );
}