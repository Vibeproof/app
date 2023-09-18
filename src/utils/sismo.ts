import axios from "axios";
import { capitalize } from "lodash";

export const favoriteGroups = [
    '0xd630aa769278cacde879c5c0fe5d203c',
    '0xff7653240feecd7448150005a95ac86b',
    '0x42c768bb8ae79e4c5c05d3b51a4ec74a',
    '0x1cde61966decb8600dfd0749bd371f12',
    '0x0f800ff28a426924cbe66b67b9f837e2',
    '0xab882512e97b60cb2295a1c190c47569',
];


export type SismoGroupData = {
    id: string;
    title: string;
    dataUrl: string;
    name: string;
    description: string | null;
    properties: {
        accountsNumber: number;
    };
    specs: string;
    tags: string[];
    timestamp: number;
}


export async function getSismoGroups() {
    const response = await axios.get('https://hub.sismo.io/groups/latests');

    const groups = response.data.items.map((group: any) => {
        return {
            ...group,
            title: group.name.split('-').map(capitalize).join(' '),
        };
    });

    const favoriteGroupsFirst = [
        ...groups.filter((group: any) => favoriteGroups.includes(group.id)),
        ...groups.filter((group: any) => !favoriteGroups.includes(group.id))
    ];

    return favoriteGroupsFirst;
}