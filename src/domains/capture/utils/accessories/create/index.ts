/**
 *
 */

import { List } from "@raycast/api"
import { SafeDataColumn } from "../../../../shared/data/definitions"
import { DataStoreState } from "../../../types"
import { createDataColumnListItemErrorAccessories } from "./errors"
import { createDataColumnListItemRequiredAccessories } from "./required"
import { createDataColumnListItemRuleAccessories } from "./rules"
import { createDataColumnListItemSpacerAccessory } from "./spacer"
import { createDataColumnListItemValueAccessories } from "./value"

export function createDataColumnListItemAccessories({
    column,
    state,
    isSelected
}: {
    column: SafeDataColumn
    state: DataStoreState | undefined
    isSelected: boolean
}): List.Item.Accessory[] {
    return isSelected
        ? [
              ...createDataColumnListItemRuleAccessories({ constraints: column.constraints ?? [] }),
              ...createDataColumnListItemRequiredAccessories({ isRequired: column.required }),
              createDataColumnListItemSpacerAccessory()
          ]
        : [
              ...createDataColumnListItemErrorAccessories({ state }),
              ...createDataColumnListItemValueAccessories({ column, state })
          ]
}
