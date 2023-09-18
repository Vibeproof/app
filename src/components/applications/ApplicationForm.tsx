import React, { useEffect } from "react";


import { Container, Grid, Group, Textarea, Button, TextInput } from "@mantine/core";
import { isEmail, useForm } from "@mantine/form";
import { Event, EventApplicationContacts, EventApplicationData, cryptography } from "@vibeproof/api";
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
import { box } from 'tweetnacl';
import { encrypt } from "../../utils/metamask";
import { IconAt, IconBrandTelegram, IconMail, IconPhone, IconUser } from "@tabler/icons-react";
import {phone} from 'phone';
import { getContactInputIcon } from "../../utils/applications";


export type ApplicationFormData = Omit<
    EventApplicationData,
    'proof' | 'signature' | 'timestamp'
>

interface Keystore {
    privateKey: string;
    encryptionKey: string;
    signatureKey: string;
    version: number;
}


export default function ApplicationForm({
    event,
    address,
    setApplicationFormData
}: {
    event: Event,
    address: string,
    setApplicationFormData: (data: ApplicationFormData) => void
}) {
    const contactInitialValues = event.contacts.reduce((acc: Object, contact: any) => {
        return {
            ...acc,
            [contact]: '',
        }
    }, {});

    const contactValidators = event.contacts.reduce((acc: Object, contact: any) => {
        if (
            contact === EventApplicationContacts.DISCORD ||
            contact === EventApplicationContacts.FACEBOOK ||
            contact === EventApplicationContacts.INSTAGRAM ||
            contact === EventApplicationContacts.TELEGRAM ||
            contact === EventApplicationContacts.TWITTER
        ) {
            return {
                ...acc,
                [contact]: (value: string) => {
                    if (value.trim().length === 0) {
                        return 'Username is required';
                    } else {
                        return (value.length < 50) ? null : 'Username is too long';
                    }
                }
            }
        } else if (contact === EventApplicationContacts.NAME) {
            return {
                ...acc,
                [contact]: (value: string) => {
                    if (value.trim().length === 0) {
                        return 'Name is required';
                    } else {
                        return (value.length < 70) ? null : 'Name is too long';
                    }
                }
            }
        } else if (contact === EventApplicationContacts.PHONE) {
            return {
                ...acc,
                [contact]: (value: string) => {
                    if (value.trim().length === 0) {
                        return 'Phone is required';
                    } else {
                        const {
                            isValid
                        } = phone(value);

                        return isValid ? null : 'Invalid phone number';
                    }
                }
            }
        } else if (contact === EventApplicationContacts.EMAIL) {
            return {
                ...acc,
                [contact]: isEmail('Invalid email')
            }
        } {
            return {
                ...acc,
                [contact]: () => null,
            };
        }
    }, {});

    const form = useForm({
        initialValues: {
            message: event.application_template,
            contacts: contactInitialValues,
        },
        // @ts-ignore
        validate: {
            message: (value) => {
                if (value.trim().length === 0) {
                    return 'Message is required';
                } else {
                    return (value.length < 1500) ? null : 'Message too long';
                }
            },
            //@ts-ignore
            contacts: contactValidators,
        }
    });

    useEffect(() => {
        const storedValue = window.localStorage.getItem('event-application-form');

        if (storedValue !== null) {
            const values = JSON.parse(storedValue);

            if (values.message.trim().length === 0) {
                return;
            }

            try {
                form.setValues(values);
            } catch (e) {
                console.log('Failed to parse stored value');
            }
        }
    }, []);

    const submit = async (values: any) => {
        const client = createWalletClient({
            chain: mainnet,
            // @ts-ignore
            transport: custom(window.ethereum)
        });

        console.log(values);

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

        const message = cryptography.symmetric.encrypt(
            values.message,
            encryptionKey
        );

        const contacts = cryptography.symmetric.encrypt(
            JSON.stringify(values.contacts),
            encryptionKey
        );

        const shared = box.before(
            decodeBase64(event.public_key),
            ephemeralKeyPair.secretKey
        );

        const shared_key = cryptography.assymetric.encrypt(
            shared, 
            encryptionKey
        );
    
        setApplicationFormData({
            id: crypto.randomUUID() as string,
            event_id: event.id,
            message: message,
            contacts: contacts,
            public_key: encodeBase64(ephemeralKeyPair.publicKey),
            keystore: keystore,
            owner: address,
            shared_key: shared_key,
            version: 0,
        });
    }

    useEffect(() => {
        window.localStorage.setItem('event-application-form', JSON.stringify(form.values));
    }, [form.values]);

    const contactInputs = event.contacts.map((contact, i) => {
        return (
            <Grid.Col key={i}>
                <TextInput
                    withAsterisk
                    label={contact}
                    icon={getContactInputIcon(contact)}
                    { ...form.getInputProps(`contacts.${contact}`) }
                />
            </Grid.Col>
        );
    });

    return (
        <form onSubmit={form.onSubmit(async (values) => submit(values))}>
            <Container>
                <Grid>
                    { contactInputs }

                    <Grid.Col span={12}>
                        <Textarea
                                withAsterisk
                                minRows={5}
                                label="Private message"
                                description="This text will be end-to-end encrypted, meaning that only event's owner will be able to read it."
                                {...form.getInputProps('message')}
                            />
                    </Grid.Col>

                    <Grid.Col>
                        <Group position="center" mt="md">
                            <Button type="submit">
                                Encrypt message and continue
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Container>
        </form>
    );
}