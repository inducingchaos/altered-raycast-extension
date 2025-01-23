/**
 *
 */

import { List } from "@raycast/api"
import { memo, useEffect, useRef, useState } from "react"
import { CaptureActions, onSearchTextChange, onSelectionChange } from "./domains/capture"
import { dataColumns } from "./domains/shared"

export function DataColumn({
    column,
    selectedItemId
}: {
    column: (typeof dataColumns)[number]
    selectedItemId: string | undefined
    previousSelectedItemId: string | undefined
}) {
    return (
        <List.Item
            key={column.id}
            id={column.id}
            title={selectedItemId === column.id ? column.label : ""}
            subtitle={selectedItemId === column.id ? column.type : column.label}
            // title={column.label}
            // subtitle={column.type}
            actions={<CaptureActions />}
            // accessories={}
        />
    )
}

export const MemoizedDataColumn = memo(DataColumn, (_, { column, previousSelectedItemId, selectedItemId }) => {
    const wasSelected = previousSelectedItemId === column.id
    const isSelected = selectedItemId === column.id

    if (wasSelected || isSelected) console.log(`Changing: ${column.id}`)

    return !wasSelected && !isSelected
})

export function DataColumnSection({
    selectedItemId,
    previousSelectedItemId
}: {
    selectedItemId: string | undefined
    previousSelectedItemId: string | undefined
}) {
    return (
        <List.Section>
            {dataColumns.map(column => (
                <MemoizedDataColumn
                    key={column.id}
                    column={column}
                    selectedItemId={selectedItemId}
                    previousSelectedItemId={previousSelectedItemId}
                />
            ))}
        </List.Section>
    )
}

export default function Capture() {
    const [searchText, setSearchText] = useState("")
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const previousSelectedItemId = useRef<string | undefined>()

    useEffect(() => {
        previousSelectedItemId.current = selectedItemId
    }, [selectedItemId])

    return (
        <List
            onSearchTextChange={value => onSearchTextChange({ searchText: value, setSearchText })}
            onSelectionChange={value => onSelectionChange({ selectedItemId: value, setSelectedItemId })}
            searchText={searchText}
            selectedItemId={selectedItemId}
            searchBarPlaceholder={"Your thought..."}
        >
            <DataColumnSection selectedItemId={selectedItemId} previousSelectedItemId={previousSelectedItemId.current} />
        </List>
    )
}
