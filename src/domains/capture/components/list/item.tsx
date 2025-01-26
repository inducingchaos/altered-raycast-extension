/**
 *
 */

import { List } from "@raycast/api"
import { CaptureActions } from "../../actions"
import { DataStore } from "../../types"
import { createDataColumnListItemAccessories } from "../../utils"
import { dataTypes, SerializableDataColumn } from "../../../shared/data/definitions"

export function DataColumnListItem({
    column,
    isSelected,
    dataStore
}: {
    column: SerializableDataColumn
    isSelected: boolean
    dataStore: DataStore
}) {
    return (
        <List.Item
            key={column.id}
            id={column.id}
            title={isSelected ? column.label : ""}
            subtitle={isSelected ? dataTypes[column.type].name : column.label}
            actions={<CaptureActions />}
            accessories={createDataColumnListItemAccessories({ column, state: dataStore.get(column.id), isSelected })}
        />
    )
}

// /**
//  * @remarks May not be necessary.
//  */
// export const MemoizedDataColumnListItem = memo(DataColumnListItem)
