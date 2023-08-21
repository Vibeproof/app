import React from "react";
import { useState, useEffect } from "react";


import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from "react-bootstrap/InputGroup";
import { Badge, Stack } from "react-bootstrap";

import Datetime from 'react-datetime';

import "react-datetime/css/react-datetime.css";

export interface EventInputFields {
    title: string;
    organizer: string;
    location: string;
    capacity: number;
    description: string;
    note: string;
    tags: string[];
    start: Date;
    end: Date;
}


const getStorageData = (keyName: string, defaultValue: any) =>{
    const savedItem = localStorage.getItem(keyName);

    return savedItem || defaultValue;
}
   
export const useLocalStorage = (
    keyName: string,
    initialValue: any,
    get = (e: any) => { return e },
    set = (e: any) => { return e }
) => {
    const [value, setValue] = useState(() => {
        return get(getStorageData(keyName, initialValue));
    });

    useEffect(() => {
        localStorage.setItem(keyName, set(value));
    }, [keyName, value]);

    return [value, setValue];
}

// @ts-ignore
export function EventCreationForm({ setInputFields }) {
    const [title, setTitle] = useLocalStorage('title', '');
    const [organizer, setOrganizer] = useLocalStorage('organizer', '');
    const [description, setDescription] = useLocalStorage('description', '');
    const [note, setNote] = useLocalStorage('note', '');
    const [location, setLocation] = useLocalStorage('location', '');

    const [capacity, setCapacity] = useLocalStorage(
        'capacity', 
        '0',
        (e: any) => { return parseInt(e, 10) },
        (e: any) => { return e.toString(10) }
    );

    const [tag,setTag] = useState('');

    const [tags, setTags] = useLocalStorage(
        'tags', '[]',
        (e: any) => { return JSON.parse(e) },
        (e: any) => { return JSON.stringify(e) }
    );

    const [eventStart, setEventStart] = useState(new Date());
    const [eventEnd, setEventEnd] = useState(new Date());

    const tagsComponents = tags.map((value: string, i: number) => {
        return (
            <Button onClick={() => {
                const index = tags.indexOf(value);

                if (index > -1) {
                    tags.splice(index, 1);
                    setTags([...tags]);
                }
            }} key={i} variant="dark" size="sm">{ value }</Button>
        );
    });

    const tag_can_be_added = tags.length < 10 && tag.length > 0 && tag.length <= 20  && !tags.includes(tag);

    const submit = (e: any) => {
        e.preventDefault();

        const input: EventInputFields = {
            title,
            organizer,
            location,
            capacity: parseInt(capacity, 10),
            description,
            note,
            tags,
            start: eventStart,
            end: eventEnd,
        };

        setInputFields(input);
    }

    return (
        <Form>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="title">
                        <Form.Label>Title</Form.Label>
                        <Form.Control onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Enter your event's title" />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="organizer">
                        <Form.Label>Organizer</Form.Label>
                        <Form.Control onChange={(e) => setOrganizer(e.target.value)} value={organizer} type="text" placeholder="What's your name?" />
                    </Form.Group>                                
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="location">
                        <Form.Label>Location</Form.Label>
                        <Form.Control onChange={(e) => setLocation(e.target.value)} value={location}  type="text" placeholder="France, Paris" />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="capacity">
                        <Form.Label>Maximum participants</Form.Label>
                        <Form.Control onChange={(e) => setCapacity(e.target.value)} value={capacity} type="number" placeholder="50" />
                    </Form.Group>                                
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Public description</Form.Label>
                        <Form.Control onChange={(e) => setDescription(e.target.value)} value={description} maxLength={1000} as="textarea" rows={4} />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="note">
                        <Form.Label>Private description</Form.Label>
                        <Form.Control onChange={(e) => setNote(e.target.value)} value={note} as="textarea" rows={4} placeholder="Eg link to the private Telegram chat or exact location"/>
                        <Form.Text className="text-muted">
                        This text will be end-to-end encrypted, meaning that only attendants approved by you will be able to read it.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Label>Event's start</Form.Label>
                    <Form.Group className="mb-3" controlId="registration_start">
                        <Datetime value={eventStart} onChange={(d) => { }} />
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Label>Event's end</Form.Label>
                    <Form.Group className="mb-3" controlId="registration_end">
                        <Datetime value={eventEnd} onChange={(d) => {}} />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Form.Label>Tags</Form.Label>
                    <InputGroup className="mb-3">
                        <Form.Control
                            placeholder="Ethereum, NFT, Gitcoin, Hacker house, ..."
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                        />
                        <Button disabled={!tag_can_be_added} variant="outline-secondary" id="button-addon2" onClick={(e) => {
                            setTag('');
                            setTags([...tags, tag]);
                        }}>
                        Add tag
                        </Button>
                    </InputGroup>

                    <Stack direction="horizontal" gap={1}>
                        { tagsComponents }
                    </Stack>

                    <Form.Text className="text-muted">
                        Up to 10 unique tags.
                    </Form.Text>
                </Col>
            </Row>

            <Row className="mt-5" style={{ textAlign: 'center' }}>
                <Col>
                    <Button variant="primary" type="submit" onClick={(e) => submit(e)}>
                        Continue
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}