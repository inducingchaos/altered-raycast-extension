/**
 *
 */

import { Color, Icon, List } from "@raycast/api"

export function getAccessories({
    value,
    isSelected
}: {
    value: string | undefined
    isSelected: boolean
}): List.Item.Accessory[] {
    const accessories: List.Item.Accessory[] = []

    const errorAccessory = {
        tag: { value: "", color: Color.Red },
        icon: { source: Icon.ExclamationMark, tintColor: Color.Red },
        tooltip: "Error"
    }
    if (!isSelected && value && value.length > 10) accessories.push(errorAccessory)

    const valueAccessory = { text: { value: value ?? "", color: Color.PrimaryText }, tooltip: "Search" }
    if (isSelected === false) accessories.push(valueAccessory)

    const rulesAccessories = [
        { tag: { value: "Max: 15", color: Color.SecondaryText }, tooltip: "Rules2" },
        { tag: { value: "Min: 0", color: Color.SecondaryText }, tooltip: "Rules3" },
        { tag: { value: "Required", color: Color.SecondaryText }, tooltip: "Rules" }
    ]
    const spacerAccessory = { text: " ".repeat(128) }
    if (isSelected) accessories.push(...rulesAccessories, spacerAccessory)

    return accessories
}
