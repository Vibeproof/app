import React from "react";
import { useState } from "react";

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


export interface SismoGroup {
    id: string;
    description: string;
    title: string;
    dataUrl: string;
    specs: string;
    properties: {
        accountsNumber: string;
    }
}


function SismoGroupCard({
    group,
    addGroup,
    isAddDisabled,
} : {
    group: SismoGroup,
    addGroup: (group: SismoGroup) => void,
    isAddDisabled: boolean
}) {
    return (
        <>
        <Card>
            <Card.Body>
                <Stack direction="horizontal" gap={3}>
                    <Card.Title style={{ textTransform: 'capitalize' }}>
                        { group.title }
                    </Card.Title>

                    <div className="ms-auto">
                        <Button
                            variant="primary"
                            onClick={() => {
                                addGroup(group);
                            }}
                            disabled={isAddDisabled}
                        >Add</Button>
                    </div>
                </Stack>

                <Card.Subtitle className="mb-2 text-muted">
                    { group.description }
                </Card.Subtitle>

                <Card.Text>
                    { group?.specs ? group?.specs : 'No specification provided' }
                </Card.Text>

                <Card.Link
                    href={group.dataUrl}
                    target="_blank"
                >Members</Card.Link>

                <Card.Link
                    href={ `https://factory.sismo.io/groups-explorer?search=${group.id}` }
                    target="_blank"
                >Sismo hub</Card.Link>
            </Card.Body>
        </Card>
        </>
    );
}


export default SismoGroupCard;