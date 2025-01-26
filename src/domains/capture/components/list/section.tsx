/**
 *
 */

import { List } from "@raycast/api"
import { SerializableDataColumn } from "../../../shared/data/definitions"
import { DataStore } from "../../types"
import { DataColumnListItem } from "./item"

export function DataColumnListSection({
    selectedItemId,
    dataColumns,
    dataStore
}: {
    selectedItemId: string | undefined
    dataColumns: SerializableDataColumn[]
    dataStore: DataStore
}) {
    return (
        <List.Section>
            {dataColumns.map(column => (
                <DataColumnListItem
                    key={column.id}
                    column={column}
                    isSelected={column.id === selectedItemId}
                    dataStore={dataStore}
                />
            ))}
        </List.Section>
    )
}
