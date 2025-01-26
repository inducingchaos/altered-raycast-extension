/**
 *
 */

import { Color, List } from "@raycast/api"
import { DataStoreState } from "../../../types"

export function createDataColumnListItemValueAccessories({
    state
}: {
    state: DataStoreState | undefined
}): List.Item.Accessory[] {
    if (!state || !state.value) return []

    return [{ text: { value: state.value, color: Color.PrimaryText }, tooltip: "Search" }]
}
