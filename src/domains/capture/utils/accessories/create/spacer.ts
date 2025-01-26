/**
 *
 */

import { List } from "@raycast/api"

export function createDataColumnListItemSpacerAccessory(): List.Item.Accessory {
    return { text: " ".repeat(256) }
}
