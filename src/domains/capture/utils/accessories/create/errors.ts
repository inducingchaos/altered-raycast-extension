/**
 *
 */

import { Color, Icon, List } from "@raycast/api"
import { DataStoreState } from "../../../types"

export function createDataColumnListItemErrorAccessories({
    state
}: {
    state: DataStoreState | undefined
}): List.Item.Accessory[] {
    if (!state || !state.errors.length) return []

    return state.errors.map(error => ({
        tag: { value: error.label, color: Color.Red },
        icon: { source: Icon.ExclamationMark, tintColor: Color.Red },
        tooltip: error.description
    }))
}
