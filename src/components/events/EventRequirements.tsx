import { Event } from "@vibeproof/api";
import React, { useEffect } from "react";
import Empty from "../Empty";
import { IconShieldOff } from "@tabler/icons-react";
import { SismoGroupData, getSismoGroups } from "../../utils/sismo";
import SismoGroupsTable from "../sismo/SismoGroupsTable";
import Loading from "../Loading";


export default function EventRequirements({
    event
}: {
    event: Event
}) {
    const [groups, setGroups] = React.useState<SismoGroupData[] | null>(null);

    useEffect(() => {
        const fetchGroups = async () => {
            const groups = await getSismoGroups();
            const eventGroups = event.sismo.claims.map((claim) => claim.groupId);

            setGroups(groups.filter((group: SismoGroupData) => eventGroups.includes(group.id)));
        }

        fetchGroups();
    }, []);

    if (event.sismo.claims.length === 0) {
        return <Empty 
            icon={<IconShieldOff size={28} />} 
            text="No requirements, anyone can apply"
        />;
    }

    if (groups === null) {
        return <Loading />;
    }

    return <SismoGroupsTable
        choosenGroups={[]}
        setChoosenGroups={() => {}}
        groups={groups}
    />;
}