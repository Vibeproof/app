import { Avatar, Button, Card, Grid, Group, Paper, Table, Tabs, Text, TextInput } from "@mantine/core";
import { ClientApplication, EventApplication, EventApplicationContacts, EventApplicationResponseData, Keystore, ResponseType, cryptography } from "@vibeproof/api";
import React from "react";
import { decodeBase64 } from "tweetnacl-util";
import { box, sign, BoxKeyPair, SignKeyPair } from "tweetnacl";
import { renderDataURI } from "@codingwithmanny/blockies";
import moment from "moment";
import { getApplicationBadge, getContactInputIcon } from "../../utils/applications";
import { HUMAN_DATE_TIME_FORMAT } from "../../utils";
import { IconAddressBook, IconAt, IconClipboard, IconMessage } from "@tabler/icons-react";


export default function ApplicationDetails({
    application,
    message,
    contacts,
    note,
    defaultTab = 'message',
    setApplicationResponse = () => {},
    showApproveButtons = true,
}: {
    application: EventApplication,
    message: string,
    contacts: any,
    note: string,
    defaultTab?: string,
    showApproveButtons?: boolean,
    setApplicationResponse?: (response: ResponseType) => void
}) {
    const contactRows = Object.keys(contacts).map((contact: string, i) => {
        return (
            <tr key={i}>
                <td>
                    <Group>
                        { getContactInputIcon(contact) }
                        { contact }
                    </Group>
                </td>
                <td>
                    { contacts[contact] }
                </td>
            </tr>
        );
    });

    return (
        <Card>
            <Card.Section>
                <Group position="apart">
                    <Group>
                        <Avatar size='md' src={ renderDataURI({ seed: application.owner }) } /> 
                        <div>
                            <Text size="sm">{ `${application.owner.slice(0, 6)}...${application.owner.slice(36)}` }</Text>
                            <Text size="xs" color="dimmed">
                                { moment(application.timestamp).format(HUMAN_DATE_TIME_FORMAT) }
                            </Text>
                        </div>
                    </Group>

                    { getApplicationBadge(application) }
                </Group>
            </Card.Section>

            <Card.Section mt='lg'>
                <Tabs defaultValue={ defaultTab }>
                    <Tabs.List>
                        <Tabs.Tab value="message" icon={<IconMessage size="0.8rem" />}>Message</Tabs.Tab>
                        <Tabs.Tab value="contacts" icon={<IconAddressBook size="0.8rem" />}>Contacts</Tabs.Tab>
                        <Tabs.Tab value="note" icon={<IconClipboard size="0.8rem" />}>Note</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="message" pt="xs">
                        <Text size='sm' style={{ whiteSpace: "pre-line" }}>
                            { message }
                        </Text>
                    </Tabs.Panel>

                    <Tabs.Panel value="contacts" pt="xs">
                        <Table>
                            <tbody>
                                { contactRows }
                            </tbody>
                        </Table>
                    </Tabs.Panel>

                    <Tabs.Panel value="note" pt="xs" mx='lg'>
                        <Text size='sm' style={{ whiteSpace: "pre-line" }}>
                            { note }
                        </Text>
                    </Tabs.Panel>
                </Tabs>
            </Card.Section>



            {
                showApproveButtons && (
                    <Card.Section inheritPadding mt='lg'>
                        <Group position="right">
                            <Button 
                                color="red"
                                onClick={() => setApplicationResponse(ResponseType.REJECTED)}
                                disabled={application.response !== null}
                            >
                                Reject
                            </Button>
        
                            <Button 
                                color="green"
                                onClick={() => setApplicationResponse(ResponseType.APPROVED)}
                                disabled={application.response !== null}
                            >
                                Approve
                            </Button>
                        </Group>
                    </Card.Section>
                )
            }
        </Card>
    );
}
