/**
 *
 */

import { List } from "@raycast/api"
import { SerializableDataColumn } from "../../../../shared/data/definitions"
import { DataStoreState } from "../../../types"
import { createDataColumnListItemErrorAccessories } from "./errors"
import { createDataColumnListItemRuleAccessories } from "./rules"
import { createDataColumnListItemValueAccessories } from "./value"

export function createDataColumnListItemAccessories({
    column,
    state,
    isSelected
}: {
    column: SerializableDataColumn
    state: DataStoreState | undefined
    isSelected: boolean
}): List.Item.Accessory[] {
    return isSelected
        ? [...createDataColumnListItemRuleAccessories({ rules: column.rules })]
        : [...createDataColumnListItemErrorAccessories({ state }), ...createDataColumnListItemValueAccessories({ state })]
}
