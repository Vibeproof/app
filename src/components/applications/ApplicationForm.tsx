import React, { useEffect } from "react";


import { Container, Grid, Group, Textarea, Button, TextInput } from "@mantine/core";
import { isEmail, useForm } from "@mantine/form";
import { Event, EventApplicationContacts, EventApplicationData, Keystore, applicationTypes, cryptography, domain } from "@vibeproof/api";
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { decodeBase64, decodeUTF8, encodeBase64 } from "tweetnacl-util";
import { box } from 'tweetnacl';
import { IconAt, IconBrandTelegram, IconMail, IconPhone, IconUser } from "@tabler/icons-react";
import {phone} from 'phone';
import { getContactInputIcon } from "../../utils/applications";
import { signMessage } from '@wagmi/core'
import * as text from './../../utils/text';
import { SismoConnectResponse } from "@sismo-core/sismo-connect-react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { signTypedData } from '@wagmi/core'
import { client } from "../../utils/client";


export type ApplicationFormData = Omit<
    EventApplicationData,
    'proof' | 'signature' | 'timestamp'
>


export default function ApplicationForm({
    event,
    address,
    sismoResponse,
}: {
    event: Event,
    address: string,
    sismoResponse: SismoConnectResponse,
}) {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = React.useState<boolean>(false);

    const contactInitialValues = event.contacts.reduce((acc: Object, contact: any) => {
        return {
            ...acc,
            [contact]: '',
        }
    }, {});

    console.log(contactInitialValues);

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
                    console.log(value, contact);
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

    // useEffect(() => {
    //     const storedValue = window.localStorage.getItem('event-application-form');

    //     if (storedValue !== null) {
    //         const values = JSON.parse(storedValue);
    //         console.log(values);

    //         if (values.message.trim().length === 0) {
    //             return;
    //         }

    //         try {
    //             form.setValues(values);
    //         } catch (e) {
    //             console.log('Failed to parse stored value');
    //         }
    //     }
    // }, []);

    const submit = async (values: any) => {
        console.log(values);
        const id = crypto.randomUUID() as string;

        const walletKeySignature = await signMessage({
            message: text.applicationSignatureRequest(id),
        });
        
        const walletKey = cryptography.symmetric.generateKey(walletKeySignature);

        const ephemeralKeyPair = cryptography.assymetric.generateKeyPair();
        const signatureKeyPair = cryptography.signature.generateKeyPair();
        const encryptionKey = cryptography.symmetric.generateKey();

        const keystoreData: Keystore = {
            ephemeralSecretKey: encodeBase64(ephemeralKeyPair.secretKey),
            encryptionKey: encryptionKey,
            signatureSecretKey: encodeBase64(signatureKeyPair.secretKey),
            version: 0,
        };

        const keystore = cryptography.symmetric.encrypt(
            JSON.stringify(keystoreData),
            walletKey
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

        const data: Omit<EventApplicationData, 'signature'> = {
            id: id,
            public_key: encodeBase64(ephemeralKeyPair.publicKey),
            keystore: keystore,

            event_id: event.id,
            message: message,
            contacts: contacts,
            proof: encodeBase64(decodeUTF8(JSON.stringify(sismoResponse))),

            shared_key: shared_key,

            timestamp: moment().toISOString(),
            owner: address,
            version: 0,
        };

        const signature = await signTypedData({
            domain,
            message: {
                ...data                
            },
            primaryType: 'Application',
            types: applicationTypes
        });

        const eventApplication = await client.service('event-applications').create({
            ...data,
            signature
        });

        navigate(`/applications/my`);
    }

    // useEffect(() => {
    //     window.localStorage.setItem('event-application-form', JSON.stringify(form.values));
    // }, [form.values]);

    const contactInputs = event.contacts.map((contact, i) => {
        return (
            <Grid.Col key={i} span={6}>
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
        <form onSubmit={form.onSubmit(async (values) => {
            setSubmitting(true);

            submit(values)
                .catch(e => {
                    setSubmitting(false);
                })
                .then(() => {
                    setSubmitting(false);
                })
        })}>
            <Container>
                <Grid>
                    { contactInputs }

                    <Grid.Col span={12}>
                        <Textarea
                            withAsterisk
                            minRows={5}
                            label="Private message"
                            description="This text is end-to-end encrypted, ensuring that only the host of this event can view it."
                            {...form.getInputProps('message')}
                        />
                    </Grid.Col>

                    <Grid.Col>
                        <Group position="center" mt="md">
                            <Button loading={submitting} type="submit">
                                Submit application
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Container>
        </form>
    );
}