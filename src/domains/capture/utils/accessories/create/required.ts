/**
 *
 */

import { Color, List } from "@raycast/api"

export function createDataColumnListItemRequiredAccessories({ isRequired }: { isRequired: boolean }): List.Item.Accessory[] {
    return isRequired
        ? [
              {
                  tag: { value: "Required", color: Color.SecondaryText },
                  tooltip: "This value is required."
              }
          ]
        : []
}
