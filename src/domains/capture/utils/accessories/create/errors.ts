/**
 *
 */

import { Color, Icon, List } from "@raycast/api"
import { DataStoreState } from "../../../types"

const MINIMAL = false

export function createDataColumnListItemErrorAccessories({
    state
}: {
    state: DataStoreState | undefined
}): List.Item.Accessory[] {
    if (!state || !state.errors.length) return []

    return state.errors.map(error => ({
        tag: { value: MINIMAL ? "" : error.label, color: Color.Red },
        icon: MINIMAL ? { source: Icon.ExclamationMark, tintColor: Color.Red } : undefined,
        tooltip: MINIMAL ? `${error.label}: ${error.description}` : error.description
    }))
}
