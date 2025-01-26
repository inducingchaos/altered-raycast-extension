/**
 *
 */

import { List } from "@raycast/api"
import { CaptureActions } from "../../actions"
import { DataStore } from "../../types"
import { createDataColumnListItemAccessories } from "../../utils"
import { dataTypes, SerializableDataColumn } from "../../../shared/data/definitions"
import { useMemo } from "react"

export function DataColumnListItem({
    column,
    isSelected,
    dataStore
}: {
    column: SerializableDataColumn
    isSelected: boolean
    dataStore: DataStore
}) {
    const value = useMemo(() => dataStore.get(column.id)?.value, [isSelected])
    const isEmpty = value === undefined || value === ""

    const title = isSelected || !isEmpty ? column.label : ""
    const subtitle = !isEmpty ? undefined : isSelected ? dataTypes[column.type].name : column.label

    return (
        <List.Item
            key={column.id}
            id={column.id}
            title={title}
            subtitle={subtitle}
            actions={<CaptureActions />}
            accessories={createDataColumnListItemAccessories({ column, state: dataStore.get(column.id), isSelected })}
        />
    )
}

// /**
//  * @remarks May not be necessary.
//  */
// export const MemoizedDataColumnListItem = memo(DataColumnListItem)
