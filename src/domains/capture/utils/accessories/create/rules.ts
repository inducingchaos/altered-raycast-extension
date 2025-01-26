/**
 *
 */

import { Color, List } from "@raycast/api"
import { DataRule } from "../../../../shared/data/definitions"

export function createDataColumnListItemRuleAccessories({ rules }: { rules: DataRule[] }): List.Item.Accessory[] {
    if (!rules.length) return []

    return rules.map(rule => ({
        tag: { value: rule.name, color: Color.SecondaryText },
        tooltip: rule.description
    }))
}
