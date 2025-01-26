/**
 *
 */

import { SetStateAction } from "react"

import { Dispatch } from "react"

import { List } from "@raycast/api"
import { SerializableDataColumn } from "../../../shared/data/definitions"
import { DataStore } from "../../types"
import { DataColumnListItem } from "./item"

export function DataColumnListSection({
    selectedItemId,
    columns,
    dataStore,
    setDataStore
}: {
    selectedItemId: string | undefined
    columns: SerializableDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
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
                />
            ))}
        </List.Section>
    )
}
