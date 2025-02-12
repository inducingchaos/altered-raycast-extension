/**
 *
 */

import { List } from "@raycast/api"
import { useMemo } from "react"
import { dataTypes, SafeDataColumn } from "../../../shared/data/definitions"
import { CaptureActions } from "../../actions"
import { createDataColumnListItemAccessories } from "../../utils"
import { useCapture } from "../context"

export function DataColumnListItem({ column }: { column: SafeDataColumn }): JSX.Element {
    const { dataStore, selectedItemId } = useCapture()

    const isSelected = selectedItemId === column.id

    const value = useMemo(() => dataStore.get(column.id)?.value, [isSelected])
    const isEmpty = value === undefined || value === ""

    const title = isSelected || !isEmpty ? column.name : ""
    const subtitle = isSelected
        ? Object.values(dataTypes).find(type => type.id === column.type)?.info.name
        : !isEmpty
          ? undefined
          : column.name

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
