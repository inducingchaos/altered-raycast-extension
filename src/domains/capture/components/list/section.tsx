/**
 *
 */

import { MutableRefObject, SetStateAction } from "react"

import { Dispatch } from "react"

import { List } from "@raycast/api"
import { SerializableDataColumn } from "../../../shared/data/definitions"
import { DataStore } from "../../types"
import { DataColumnListItem } from "./item"

export function DataColumnListSection({
    selectedItemId,
    columns,
    dataStore,
    setDataStore,
    setSelectedItemId,
    selectedItemIdUpdatedAt
}: {
    selectedItemId: string | undefined
    columns: SerializableDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>
}) {
    return (
        <List.Section>
            {columns.map(column => (
                <DataColumnListItem
                    key={column.id}
                    column={column}
                    columns={columns}
                    isSelected={column.id === selectedItemId}
                    dataStore={dataStore}
                    setDataStore={setDataStore}
                    selectedItemId={selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                    selectedItemIdUpdatedAt={selectedItemIdUpdatedAt}
                />
            ))}
        </List.Section>
    )
}
