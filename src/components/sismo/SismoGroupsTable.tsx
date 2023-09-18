import React, { useEffect, useState } from "react";
import { DataTable } from 'mantine-datatable';
import { Anchor, Avatar, Group, Text, Stack } from "@mantine/core";
import { renderDataURI } from "@codingwithmanny/blockies";
import { useDebouncedValue } from "@mantine/hooks";
import { SismoGroupData } from "../../utils/sismo";


export default function     SismoGroupsTable({
    choosenGroups = [],
    setChoosenGroups = () => {},
    selectable = false,
    pagination = false,
    groups,
    pageSize = 15,
}: {
    selectable?: boolean,
    pagination?: boolean,
    choosenGroups?: SismoGroupData[],
    setChoosenGroups?: (groups: SismoGroupData[]) => void,
    groups: SismoGroupData[],
    pageSize?: number,
}) {
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<string>('');
    const [debouncedFilter] = useDebouncedValue(filter, 200);
    const [records, setRecords] = useState<SismoGroupData[]>([]);

    useEffect(() => {
        setRecords(groups.slice(0, pageSize));
    }, []);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;

        setRecords(groups.slice(from, to));
    }, [page]);

    const selectableProps = {
        selectedRecords: choosenGroups,
        onSelectedRecordsChange: setChoosenGroups,        
    }

    const paginationProps = {
        totalRecords: groups.length,
        recordsPerPage: pageSize,
        page: page,
        onPageChange: (p: number) => setPage(p),
    }

    const props = {
        ...(selectable && selectableProps),
        ...(pagination && paginationProps),
    }

    console.log(props);

    return (
        // @ts-ignore
        <DataTable 
            withBorder={false}
            highlightOnHover
            columns={[
                {
                    accessor: 'title',
                    title: 'Title', 
                    // width: '50%',
                    render: (group: SismoGroupData) => {
                        return (
                            <Group>
                                <Avatar size='sm' src={ renderDataURI({ seed: group.id }) }/>
                            
                                { group.title }                    
                            </Group>    
                        );
                    },
                },
                { 
                    accessor: 'properties.accountsNumber',
                    title: 'Members',
                    // width: '100%',
                    render: (group) => {
                        return (
                            <Anchor href={group.dataUrl} target="_blank">{group.properties.accountsNumber}</Anchor>
                        );
                    }
                },
            ]}
            { ...props }
            records={records}
            rowExpansion={{
                content: ({ record }) => (
                    <Stack p="xs" spacing={6}>
                        <Text fw={500}>Description</Text>
                        <Text>
                            { record.description }
                        </Text>

                        <Text fw={500}>Specification</Text>
                        <Text>
                            { record.specs }
                        </Text>
                    </Stack>
                ),
            }}
        />
    );
}