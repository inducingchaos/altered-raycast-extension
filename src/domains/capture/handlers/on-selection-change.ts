/**
 *
 */

import { debug, shouldShowDebug } from "../../shared/TEMP"

export function onSelectionChange({
    selectedItemId,
    setSelectedItemId
}: {
    selectedItemId: string | null
    setSelectedItemId: (id: string | undefined) => void
}): void {
    if (!selectedItemId) throw new Error("'Null' item selected - handle this edge case.")

    debug.state.onSelectionChange.count++
    if (shouldShowDebug({ for: "onSelectionChange" }))
        console.log(`#${debug.state.onSelectionChange.count}, in 'onSelectionChange': ${selectedItemId}`)

    setSelectedItemId(selectedItemId)
}
