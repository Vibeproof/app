import React from "react";


import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from "react-bootstrap/InputGroup";
import ListGroup from "react-bootstrap/ListGroup";

import { Stepper } from 'react-form-stepper';
// @ts-ignore
import { EventData } from "@snaphost/api";


import { v4 as uuidv4 } from 'uuid'
import EventCard from "./EventCard";
import { EventCreationForm, EventInputFields } from "./EventCreationForm";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { EventCreationConnectWallet } from "./EventCreationConnectWallet";
import { WalletContext } from "../context/wallet";


import { Routes, Route, Link } from 'react-router-dom';


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
    step: EventCreationSteps
}

class EventCreationPage extends React.Component<IEventFormProps, IEventFormState> {
    static contextType = WalletContext;

    constructor(props: IEventFormProps) {
        super(props);

        this.state = {
            input_fields: null,
            event_id: null,
            step: EventCreationSteps.CONNECT_WALLET
        };
    }

    componentDidMount() {
        console.log('EventCreationPage mounted');
    }

    setInputFields = (input_fields: EventInputFields) => {
        console.log(input_fields);

        this.setState({
            input_fields: input_fields
        });
    }

    isActiveStep = (step: EventCreationSteps) => {
        return this.state.step === step;
    }

    getActiveStepComponent(): JSX.Element {
        switch(this.state.step) {
            case EventCreationSteps.CONNECT_WALLET:
                return <EventCreationConnectWallet />;
            default:
                return <p>Different step</p>;
        }
    }

    render() {
        const {
            // @ts-ignore
            address
        } = this.context;

        return (
            <Container fluid='sm' className='pt-5'>
                <Row>
                    <Col xs={12} md={3}>
                        <ListGroup>
                            <ListGroup.Item active={this.isActiveStep(EventCreationSteps.CONNECT_WALLET)}>
                                Connect wallet
                            </ListGroup.Item>
                            
                            <ListGroup.Item active={this.isActiveStep(EventCreationSteps.FILL_DETAILS)}>
                                Fill out the details
                            </ListGroup.Item>
                            
                            <ListGroup.Item active={this.isActiveStep(EventCreationSteps.ENCRYPT_DETAILS)}>
                                Encrypt private details
                            </ListGroup.Item>

                            <ListGroup.Item active={this.isActiveStep(EventCreationSteps.SET_REQUIREMENTS)}>
                                Set the requirements
                            </ListGroup.Item>

                            <ListGroup.Item active={this.isActiveStep(EventCreationSteps.DONE)}>
                                Done
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col>
                        { this.getActiveStepComponent() }
                    </Col>
                </Row>
            </Container>
        );
    }
}


export default EventCreationPage;