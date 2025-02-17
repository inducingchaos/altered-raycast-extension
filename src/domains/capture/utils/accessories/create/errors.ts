/**
 *
 */

import { Color, List } from "@raycast/api"
import { DataStoreState } from "../../../types"

export function createDataColumnListItemErrorAccessories({
    state
}: {
    state: DataStoreState | undefined
}): List.Item.Accessory[] {
    if (!state || !state.errors.length) return []

    return state.errors.map(error => ({
        tag: { value: error.title, color: Color.Red },
        tooltip: error.message
    }))
}
