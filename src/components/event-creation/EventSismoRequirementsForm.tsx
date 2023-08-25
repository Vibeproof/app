import React, { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import axios from "axios";
import SismoGroupCard from "../SismoGroupCard";

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Stack from 'react-bootstrap/Stack';

import {
    ClaimRequest,
    ClaimType,
    SismoConnectButton,
    SismoConnectResponse
} from "@sismo-core/sismo-connect-react";


const favoriteGroups = [
    '0x0f800ff28a426924cbe66b67b9f837e2',
    '0xd630aa769278cacde879c5c0fe5d203c',
    '0xff7653240feecd7448150005a95ac86b',
    '0x42c768bb8ae79e4c5c05d3b51a4ec74a',
    '0x1cde61966decb8600dfd0749bd371f12',
    '0xab882512e97b60cb2295a1c190c47569',
];


function EventSismoRequirementsForm(
    {
        setClaims 
    } : {
        setClaims: (claims: ClaimRequest[], proof: '') => void
    }
) {
    const [sismoGroups, setSismoGroups] = React.useState<any[]>([]);
    const [choosenGroups, setChoosenGroups] = React.useState<any[]>([]);
    const [filter, setFilter] = React.useState<string>('');
    const [showProofButton, setShowProofButton] = React.useState<boolean>(false);

    useEffect(() => {
        axios.get('https://hub.sismo.io/groups/latests').then((response) => {
            const groups = response.data.items.map((group: any) => {
                return {
                    ...group,
                    title: group.name.replaceAll('-', ' ')
                };
            });

            console.log('favoriteGroups');
            console.log(groups.find((group: any) => favoriteGroups.includes(group.id)));

            const favoriteGroupsFirst = [
                ...groups.filter((group: any) => favoriteGroups.includes(group.id)),
                ...groups.filter((group: any) => !favoriteGroups.includes(group.id))
            ];

            console.log('favoriteGroupsFirst');
            console.log(favoriteGroupsFirst[0]);

            setSismoGroups(favoriteGroupsFirst);
        });
    }, []);

    const addGroupCallback = (group: any) => {
        setChoosenGroups([
            ...choosenGroups,
            group
        ]);
    }

    const removeGroupCallback = (i: number) => {
        setChoosenGroups(choosenGroups.filter((_, index) => index !== i));
    }

    const sismoGroupsCards = sismoGroups
        .filter((group) => {
            return (
                group.title.toLowerCase().includes(filter.toLowerCase())
                || group.description?.toLowerCase().includes(filter.toLowerCase()) 
            ) && (!choosenGroups.includes(group));
        })
        .map((group, i) => {
            return (
                <Col key={i}>
                    <SismoGroupCard 
                        key={i}
                        group={group}
                        addGroup={addGroupCallback}
                        isAddDisabled={choosenGroups.length === 5}
                        />
                </Col>
            );
        });

    const chosenGroupComponents = choosenGroups.map((group, i) => {
        return (
            <div key={i} className="mb-2">
                <Stack direction="horizontal" gap={3} style={{ textTransform: 'capitalize' }}>
                    <Card.Subtitle className="mb-0">{ group.title }</Card.Subtitle>

                    <div className="ms-auto">
                        <Button 
                            size="sm"
                            variant="outline-danger"
                            onClick={() => { removeGroupCallback(i); }}
                        >—</Button>
                    </div>
                </Stack>
                <hr/>
            </div>
        );
    });

    return (
        <Container>
            <Row>
                <Col style={{ textAlign: 'center' }}>
                    <h1>Set requirements for applicants</h1>
                    <p>Powered by Sismo</p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-">Search</InputGroup.Text>
                        <Form.Control
                            aria-label="Small"
                            aria-describedby="inputGroup-sizing-sm"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Container fluid='sm'>
                        <Row md={1} className="g-4">
                            { sismoGroupsCards }
                        </Row>            
                    </Container>
                </Col>

                <Col>
                    {!showProofButton && <Card>
                        <Card.Body>
                            <Card.Title className="">
                                Total { choosenGroups.length } requirements
                            </Card.Title>

                            <hr></hr>

                            { chosenGroupComponents }

                            <Button 
                                className="mt-3 w-100"
                                variant="primary"
                                onClick={() => {
                                    setClaims(choosenGroups.map(group => {
                                        return {
                                            claimType: ClaimType.GTE,
                                            value: 1,
                                            groupId: group.id,
                                            isOptional: true
                                        }
                                    }), '');
                                    // if (choosenGroups.length === 0) {
                                    //     setClaims([], '');
                                    // } else {
                                    //     setShowProofButton(true);
                                    // }
                                }}
                            >
                                Continue
                            </Button>
                        </Card.Body>
                    </Card>}

                    {/* {
                        showProofButton && <Card>
                            <Card.Body>
                                <Card.Title>
                                    Proof your requirements
                                </Card.Title>
                                <Card.Subtitle className="text-muted">
                                    Proof your requirements by signing in with Sismo
                                </Card.Subtitle>
                            </Card.Body>

                            <SismoConnectButton
                                config={{
                                    appId: '0x87e85da6085ed10602ede76bada27c7b'
                                }}
                                auths={[]}
                                claims={choosenGroups.map((group) => {
                                    return {
                                        groupId: group.id,
                                        isOptional: true
                                    }
                                })}
                                onResponse={async (bytes: SismoConnectResponse) => {
                                    console.log(bytes);
                                }}
                                text="Proof your own requirements"
                            />
                        </Card>
                    } */}
                </Col>
            </Row>
        </Container>
    );
}


export default EventSismoRequirementsForm;