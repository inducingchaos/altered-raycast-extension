/**
 *
 */

import { List } from "@raycast/api"
import { SerializableDataColumn } from "../../../shared/data/definitions"
import { DataStore } from "../../types"
import { DataColumnListItem } from "./item"

export function DataColumnListSection({
    selectedItemId,
    columns,
    dataStore
}: {
    selectedItemId: string | undefined
    columns: SerializableDataColumn[]
    dataStore: DataStore
}) {
    return (
        <List.Section>
            {columns.map(column => (
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
