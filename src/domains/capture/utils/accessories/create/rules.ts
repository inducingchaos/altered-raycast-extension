/**
 *
 */

import { Color, List } from "@raycast/api"
import { configureDataConstraint, SerializableDataConstraint } from "~/domains/shared/data/definitions/constraints"

export function createDataColumnListItemRuleAccessories({
    constraints
}: {
    constraints: SerializableDataConstraint[]
}): List.Item.Accessory[] {
    if (!constraints.length) return []

    return constraints.map(constraint => {
        const { label, instructions } = configureDataConstraint({ ...constraint })

        return {
            tag: { value: label, color: Color.SecondaryText },
            tooltip: instructions
        }
    })
}

export function TEMP_createSubtitleAccessories({
    constraints
}: {
    constraints?: SerializableDataConstraint[]
}): string | undefined {
    if (!constraints?.length) return undefined

    return constraints
        .map(constraint => {
            const { label } = configureDataConstraint({ ...constraint })

            return label
        })
        .join(" — ")
}
