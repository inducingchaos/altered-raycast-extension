/**
 *
 */

import { List } from "@raycast/api"
import { SerializableDataColumn } from "../../../../shared/data/definitions"
import { DataStoreState } from "../../../types"
import { createDataColumnListItemErrorAccessories } from "./errors"
import { createDataColumnListItemRuleAccessories } from "./rules"
import { createDataColumnListItemValueAccessories } from "./value"
import { createDataColumnListItemRequiredAccessories } from "./required"
import { createDataColumnListItemSpacerAccessory } from "./spacer"

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
        ? [
              ...createDataColumnListItemRuleAccessories({ rules: column.rules ?? [] }),
              ...createDataColumnListItemRequiredAccessories({ isRequired: column.required }),
              createDataColumnListItemSpacerAccessory()
          ]
        : [
              ...createDataColumnListItemErrorAccessories({ state }),
              ...createDataColumnListItemValueAccessories({ column, state })
          ]
}
