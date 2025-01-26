/**
 *
 */

import { List } from "@raycast/api"
import { CaptureActions } from "../../actions"
import { DataStore } from "../../types"
import { createDataColumnListItemAccessories } from "../../utils"
import { dataTypes, SerializableDataColumn } from "../../../shared/data/definitions"
import { Dispatch, MutableRefObject, SetStateAction, useMemo } from "react"

export function DataColumnListItem({
    column,
    columns,
    isSelected,
    dataStore,
    setDataStore,
    selectedItemId,
    setSelectedItemId,
    selectedItemIdUpdatedAt
}: {
    column: SerializableDataColumn
    columns: SerializableDataColumn[]
    isSelected: boolean
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
    selectedItemId: string | undefined
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>
}) {
    const value = useMemo(() => dataStore.get(column.id)?.value, [isSelected])
    const isEmpty = value === undefined || value === ""

    const title = isSelected || !isEmpty ? column.label : ""
    const subtitle = isSelected ? dataTypes[column.type].name : !isEmpty ? undefined : column.label

    return (
        <List.Item
            key={column.id}
            id={column.id}
            title={title}
            subtitle={subtitle}
            actions={
                <CaptureActions
                    columns={columns}
                    dataStore={dataStore}
                    setDataStore={setDataStore}
                    selectedItemId={selectedItemId}
                    setSelectedItemId={setSelectedItemId}
                    selectedItemIdUpdatedAt={selectedItemIdUpdatedAt}
                />
            }
            accessories={createDataColumnListItemAccessories({ column, state: dataStore.get(column.id), isSelected })}
        />
    )
}

// /**
//  * @remarks May not be necessary.
//  */
// export const MemoizedDataColumnListItem = memo(DataColumnListItem)
