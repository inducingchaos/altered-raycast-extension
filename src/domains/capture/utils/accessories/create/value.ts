/**
 *
 */

import { Color, List } from "@raycast/api"
import { DataStoreState } from "../../../types"
import { SerializableDataColumn } from "../../../../shared/data/definitions"

export function createDataColumnListItemValueAccessories({
    column,
    state
}: {
    column: SerializableDataColumn
    state: DataStoreState | undefined
}): List.Item.Accessory[] {
    if ((!state || !state.value) && !column.default) return []

    if (!state || !state.value)
        return [{ text: { value: column.default, color: Color.SecondaryText }, tooltip: "The default column value." }]

    return [{ text: { value: state.value, color: Color.PrimaryText }, tooltip: "The current column value." }]
}
