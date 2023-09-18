import { Badge } from "@mantine/core"
import { EventApplication, EventApplicationContacts, ResponseType } from "@vibeproof/api"
import { IconAt, IconMail, IconPhone, IconUser } from "@tabler/icons-react"

export const getApplicationBadge = (eventApplication: EventApplication) => {
    if (eventApplication.response == null) {
        return <Badge color='gray'>Pending</Badge>
    } else if (eventApplication.response.type === ResponseType.APPROVED) {
        return <Badge color='green'>Approved</Badge>
    } else {
        return <Badge color='red'>Rejected</Badge>
    }
}


export const getContactInputIcon = (contact: string) => {
    if (
        contact === EventApplicationContacts.TELEGRAM ||
        contact === EventApplicationContacts.TWITTER ||
        contact === EventApplicationContacts.DISCORD ||
        contact === EventApplicationContacts.INSTAGRAM ||
        contact === EventApplicationContacts.FACEBOOK
    ) {
        return <IconAt size="0.8rem" />;
    } else if (contact === EventApplicationContacts.PHONE) {
        return <IconPhone size="0.8rem" />;
    } else if (contact === EventApplicationContacts.EMAIL) {
        return <IconMail size="0.8rem" />;
    } else if (contact === EventApplicationContacts.NAME) {
        return <IconUser size="0.8rem" />;
    } else {
        return null;
    }
}
