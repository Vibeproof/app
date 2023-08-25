import React, { useEffect } from "react";


import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from "react-bootstrap/InputGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from 'react-bootstrap/Spinner';

import { Stepper } from 'react-form-stepper';
// @ts-ignore
import { EventData } from "@snaphost/api";


import { v4 as uuidv4 } from 'uuid'
import EventCard from "../EventCard";
import { EventCreationForm, EventInputFields } from "./EventCreationForm";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { EventCreationConnectWallet } from "./EventCreationConnectWallet";


import { Routes, Route, Link } from 'react-router-dom';
import { fetchEnsName } from '@wagmi/core'
import { feathers } from "@feathersjs/feathers";
import EventNoteEncryption from "./EventNoteEncryption";
import EventSismoRequirementsForm from "./EventSismoRequirementsForm";
import { ClaimRequest } from "@sismo-core/sismo-connect-react";
import EventCreationDone from "./EventCreationDone";


export interface IEventFormProps {

}

enum EventCreationSteps {
    CONNECT_WALLET,
    FILL_DETAILS,
    ENCRYPT_DETAILS,
    SET_REQUIREMENTS,
    DONE,
}

export interface IEventFormState {
    input_fields: EventInputFields | null;
    event_id: string | null;
    claims: ClaimRequest[];
    step: EventCreationSteps
}


function Loader() {
    return (
        <div className="d-flex justify-content-center mt-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
}


function EventCreationPage() {
    const { address, isConnected } = useAccount();
    const [ens, setEns] = React.useState<string | null>(null);
    const [eventId, ] = React.useState<string>(uuidv4());
    const [step, setStep] = React.useState<EventCreationSteps>(EventCreationSteps.CONNECT_WALLET);
    const [inputFields, setInputFields] = React.useState<EventInputFields | null>(null);
    const [noteEncrypted, setNoteEncrypted] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [claims, setClaims] = React.useState<ClaimRequest[]>([]);
    const [proof, setProof] = React.useState<string | null>(null);

    useEffect(() => {
        if (isConnected === false) {
            setEns(null);
            setStep(EventCreationSteps.CONNECT_WALLET);

            return;
        }
        setStep(EventCreationSteps.FILL_DETAILS);

        // // @ts-ignore
        // fetchEnsName({ address }).then((ensName) => {
        //     if (ensName) {
        //         setEns(ensName);
        //         // setStep(EventCreationSteps.SET_REQUIREMENTS);
        //         setStep(EventCreationSteps.FILL_DETAILS);
        //     } else {
        //         setEns(null);
        //         setStep(EventCreationSteps.CONNECT_WALLET);
        //     }
        // });
    }, [address]);

    const setInputFieldsCallback = (inputFields: EventInputFields) => {
        setInputFields(inputFields);

        if (inputFields.note === '') {
            setStep(EventCreationSteps.SET_REQUIREMENTS);
        } else {
            setStep(EventCreationSteps.ENCRYPT_DETAILS);
        }
    }

    const setNoteEncryptedCallback = (noteEncrypted: string) => {
        setNoteEncrypted(noteEncrypted);
        setStep(EventCreationSteps.SET_REQUIREMENTS);
    }

    const setClaimsCallback = (claims: ClaimRequest[], proof: '') => {
        setClaims(claims);
        setProof(proof);

        setStep(EventCreationSteps.DONE);
    }

    const toggleLoading = () => {
        setLoading(!loading);
    }

    const setStepAndToggleLoader = (step: EventCreationSteps) => {
        toggleLoading();
        setStep(step);
    }

    const isStepDone = (step_: EventCreationSteps) => {
        return false;
    }

    return (
        <Container fluid='sm' className='pt-5'>
            <Row>
                <Col xs={12} md={3}>
                    <ListGroup>
                        <ListGroup.Item
                            active={ step === EventCreationSteps.CONNECT_WALLET } 
                            variant={ isStepDone(EventCreationSteps.CONNECT_WALLET) ? 'primary' : '' }
                        >
                            Connect wallet
                        </ListGroup.Item>
                        
                        <ListGroup.Item 
                            active={ step === EventCreationSteps.FILL_DETAILS }
                            variant={ isStepDone(EventCreationSteps.FILL_DETAILS) ? 'primary' : '' }
                        >
                            Fill out the details
                        </ListGroup.Item>
                        
                        <ListGroup.Item
                            active={ step === EventCreationSteps.ENCRYPT_DETAILS }
                            variant={ isStepDone(EventCreationSteps.ENCRYPT_DETAILS) ? 'primary' : '' }
                        >
                            Encrypt private details
                        </ListGroup.Item>

                        <ListGroup.Item
                            active={ step === EventCreationSteps.SET_REQUIREMENTS }
                            variant={ isStepDone(EventCreationSteps.SET_REQUIREMENTS) ? 'primary' : '' }
                        >
                            Set the requirements
                        </ListGroup.Item>

                        <ListGroup.Item
                            active={ step === EventCreationSteps.DONE }
                            variant={ isStepDone(EventCreationSteps.DONE) ? 'primary' : '' }
                        >
                            Done
                        </ListGroup.Item>
                    </ListGroup>
                </Col>

                <Col>
                    {
                        step === EventCreationSteps.CONNECT_WALLET 
                        && <EventCreationConnectWallet
                            notEns={false}
                        /> 
                    }

                    {
                        step === EventCreationSteps.FILL_DETAILS 
                        // && ens !== null
                        && <EventCreationForm 
                            setInputFields={setInputFieldsCallback} 
                            // ensName={ens}
                            ensName="test.eth"
                        />
                    }

                    {
                        step === EventCreationSteps.ENCRYPT_DETAILS 
                        && inputFields
                        && address 
                        && <EventNoteEncryption 
                            note={inputFields.note}
                            address={address}
                            eventId={eventId}
                            setNoteEncrypted={setNoteEncryptedCallback}
                        /> 
                    }

                    {
                        step === EventCreationSteps.SET_REQUIREMENTS 
                        && <EventSismoRequirementsForm
                            setClaims={setClaimsCallback}
                        />
                    }

                    {
                        address
                        && noteEncrypted
                        && claims
                        && inputFields
                        && step === EventCreationSteps.DONE
                        && <EventCreationDone
                            eventId={eventId}
                            address={address}
                            claims={claims}
                            noteEncrypted={noteEncrypted}
                            public_key="0x123123"
                            inputFields={inputFields}
                        />
                    }
                </Col>
            </Row>
        </Container>
    );
}

export default EventCreationPage;