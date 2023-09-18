import { Box, Button, Chip, Container, Grid, Group, Input, MultiSelect, NumberInput, TextInput, Textarea } from "@mantine/core";
import { IconHash, IconPhone, IconUser } from "@tabler/icons-react";
import { DateTimePicker } from '@mantine/dates';
import { useLocalStorage } from '@mantine/hooks';
import { isInRange, useForm } from '@mantine/form';

import moment, { Moment } from 'moment';

import React, { useEffect } from "react";
import { InternalRpcError, createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { isValidUrl } from "../../utils/validators";
import { EventApplicationContacts, EventData, cryptography } from '@vibeproof/api';

import {
    encodeBase64,
    decodeBase64
} from "tweetnacl-util";

import { encrypt } from "../../utils/metamask";
  

const defaultTags = [
    'Meetup',
    'Hackathon',
    'Zero Knowledge',
    'NFT',
    'Hacker house',
    'Workshop',
    'Sport',
];


interface Keystore {
    privateKey: string;
    encryptionKey: string;
    signatureKey: string;
    version: number;
}

export type EventFormData = Omit<
    EventData,
    'sismo' | 'signature' | 'timestamp'
>;


export default function EventForm({
    address,
    setEventFormData
}: {
    address: string,
    setEventFormData: (data: EventFormData) => void
}) {
    const [signing, setSigning] = React.useState<boolean>(false);

    const form = useForm({
        initialValues: {
            title: '',
            link: '',
            location: '',
            capacity: '',
            description: '',
            note: '',
            application_template: '',
            start: new Date(moment().add(1, 'days').format()),
            end: new Date(moment().add(2, 'days').format()),
            tags: [
                'Meetup'
            ],
            contacts: [
                EventApplicationContacts.NAME,
                EventApplicationContacts.DISCORD,
                EventApplicationContacts.TWITTER,
            ],
        },
        validate: {
            title: (value) => {
                return value.trim().length > 5 ? null : 'Title too short';
            },
            tags: (value) => {
                return value.length < 2 ? 'Select at least 2 tags' : null;
            },
            link: (value) => {
                if (value.trim().length === 0) {
                    return null;
                } else {
                    return isValidUrl(value) ? null : 'Wrong link';
                }
            },
            location: (value) => {
                if (value.trim().length === 0) {
                    return null;
                } else {
                    return (value.length < 50) ? null : 'Location too long';
                }
            },
            capacity: isInRange({ min: 0 }, 'Capacity can\'t be zero'),
            description: (value) => {
                if (value.trim().length === 0) {
                    return 'Description is required';
                } else {
                    return (value.length < 2500) ? null : 'Description too long';
                }
            },
            note: (value) => {
                if (value.trim().length === 0) {
                    return 'Note is required';
                } else {
                    return (value.length < 1500) ? null : 'Note too long';
                }
            },
            application_template: (value) => {
                return (value.trim().length < 1500) ? null : 'Note too long';
            },
            start: (value) => { 
                if (value < new Date()) {
                    return 'Start date should be in the future';
                }

                return null;
            },
            end: (value) => {
                if (value < form.values.start) {
                    return 'End date should be after start date';
                }

                return null;
            },
        }
    });

    useEffect(() => {
        const storedValue = window.localStorage.getItem('event-creation-form');

        if (storedValue !== null) {
            const values = JSON.parse(storedValue);

            form.setFieldValue('start', new Date(values.start));
            form.setFieldValue('end', new Date(values.end));

            delete values.start;
            delete values.end;

            try {
                form.setValues(values);
            } catch (e) {
                console.log('Failed to parse stored value');
            }
        }
    }, []);
    
    useEffect(() => {
        window.localStorage.setItem('event-creation-form', JSON.stringify(form.values));
    }, [form.values]);

    const submit = async (values: any) => {
        const client = createWalletClient({
            chain: mainnet,
            // @ts-ignore
            transport: custom(window.ethereum)
        });

        const wallet_public_key = await client.request({
            // @ts-ignore
            method: 'eth_getEncryptionPublicKey',
            // @ts-ignore
            params: [address],
        });

        const ephemeralKeyPair = cryptography.assymetric.generateKeyPair();
        const signatureKeyPair = cryptography.signature.generateKeyPair();
        const encryptionKey = cryptography.symmetric.generateKey();

        const keystoreData: Keystore = {
            privateKey: encodeBase64(ephemeralKeyPair.secretKey),
            encryptionKey: encryptionKey,
            signatureKey: encodeBase64(signatureKeyPair.secretKey),
            version: 0,
        };

        const keystore = encrypt(
            JSON.stringify(keystoreData),
            wallet_public_key as string
        );

        const note = cryptography.symmetric.encrypt(
            values.note,
            encryptionKey
        );

        const registration_start = moment();
        const registration_end = moment(values.start).subtract(1, 'minute');
    
        setEventFormData({
            id: crypto.randomUUID() as string,
            title: values.title,
            link: values.link,
            contacts: values.contacts,
            location: values.location,
            capacity: values.capacity,
            description: values.description,
            application_template: values.application_template,
            public_key: encodeBase64(ephemeralKeyPair.publicKey),
            signature_public_key: encodeBase64(signatureKeyPair.publicKey),
            registration_start: registration_start.toISOString(),
            registration_end: registration_end.toISOString(),
            start: moment(values.start).toISOString(),
            end: moment(values.end).toISOString(),
            price: 0,
            tags: values.tags,
            note: note,
            keystore: keystore,
            version: 0,
            owner: address
        });
    }

    return (
        <form onSubmit={form.onSubmit(async (values) => {
            setSigning(true);

            submit(values)
                .catch(e => {
                    setSigning(false);

                    if (e instanceof InternalRpcError) {
                        const error = e as InternalRpcError;
                    }
                })
                .then(() => {
                    setSigning(false);
                });
        })}>
            <Container>
                <Grid>
                    <Grid.Col span={6}>
                        <TextInput
                            withAsterisk
                            label="Title"
                            placeholder="John's hacker house"
                            {...form.getInputProps('title')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput 
                            label="Link"
                            placeholder="https://hacker-john.com"
                            {...form.getInputProps('link')}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            label="Location"
                            description="Leave empty if it's an online event"
                            placeholder="USA, NY"
                            {...form.getInputProps('location')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NumberInput 
                            withAsterisk
                            label="Capacity"
                            description="Maximum amount of participants"
                            placeholder=""
                            {...form.getInputProps('capacity')}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            withAsterisk
                            minRows={15}
                            label="Public description"
                            description="This description is public. Use note for a private information"
                            placeholder="Put your description here"
                            {...form.getInputProps('description')}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            withAsterisk
                            minRows={5}
                            label="Private note"
                            description="This text will be end-to-end encrypted, meaning that only attendants approved by you will be able to read it."
                            placeholder="For example exact event's location or link to the private Telegram chat"
                            {...form.getInputProps('note')}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        {/* <Input.Label>Applicant's details</Input.Label>
                        <Input.Description>Applicants are required to fill this information.</Input.Description> */}


                        <Input.Wrapper 
                            id="contacts" 
                            label="Applicant's details"
                            description="Applicants are required to provide this information"
                        >
                            <Chip.Group multiple value={form.values.contacts} onChange={(e) => {
                                console.log(e);
                                form.setFieldValue('contacts', e as EventApplicationContacts[])
                            }}>
                                <Group mt={'md'}>
                                    <Chip value={EventApplicationContacts.NAME}>Name</Chip>
                                    <Chip value={EventApplicationContacts.PHONE}>Phone</Chip>
                                    <Chip value={EventApplicationContacts.EMAIL}>Email</Chip>
                                    <Chip value={EventApplicationContacts.DISCORD}>Discord</Chip>
                                    <Chip value={EventApplicationContacts.FACEBOOK}>Facebook</Chip>
                                    <Chip value={EventApplicationContacts.INSTAGRAM}>Instagram</Chip>
                                    <Chip value={EventApplicationContacts.TWITTER}>Twitter</Chip>
                                    <Chip value={EventApplicationContacts.TELEGRAM}>Telegram</Chip>
                                </Group>
                            </Chip.Group>
                        </Input.Wrapper>
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            minRows={5}
                            label="Application template"
                            description="Each applicant will be asked to fill the message. The message will be e2e encrypted and only you will be able to read it."
                            placeholder="Where are you from, what is your T-shirt size, ..."
                            {...form.getInputProps('application_template')}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <DateTimePicker
                            withAsterisk
                            valueFormat="DD MMM YYYY hh:mm A"
                            label="Start date and time"
                            placeholder="Pick date and time"
                            maw={400}
                            mx="auto"
                            {...form.getInputProps('start')}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <DateTimePicker
                            withAsterisk
                            valueFormat="DD MMM YYYY hh:mm A"
                            label="End date and time"
                            placeholder="Pick date and time"
                            maw={400}
                            mx="auto"
                            {...form.getInputProps('end')}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <MultiSelect
                            withAsterisk
                            icon={<IconHash size={15}/>}
                            label="Tags"
                            placeholder="Select tags"
                            searchable
                            creatable
                            getCreateLabel={(query) => `+ ${query}`}
                            data={[...defaultTags, ...form.values.tags]}
                            value={form.values.tags}
                            maxSelectedValues={10}
                            onChange={(value) => {
                                console.log('change');
                                console.log(form.values.tags);
                                console.log(value);

                                form.setFieldValue('tags', [...value]);
                            }}
                            error={form.errors.tags}
                            onCreate={(value) => {
                                console.log('create', value);
                                // form.setFieldValue('tags', [...form.values.tags, value]);
                                return value;
                            }}
                        />
                    </Grid.Col>
                    <Grid.Col>
                        <Group position="center" mt="md">
                            <Button 
                                type="submit"
                                loading={signing}
                            >
                                { signing ? 'Signing' : 'Encrypt note and continue' }
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Container>
        </form>
    );
}