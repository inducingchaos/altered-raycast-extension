/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { debug, shouldShowDebug } from "../../shared/TEMP"

export function onSelectionChange({
    selectedItemId,
    selectedAt,
    setSelectedItemId
}: {
    selectedItemId: string | null
    selectedAt: MutableRefObject<number>
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
}): void {
    if (!selectedItemId) throw new Error("'Null' item selected - handle this edge case.")

    debug.state.onSelectionChange.count++
    if (shouldShowDebug({ for: "onSelectionChange" }))
        console.log(`#${debug.state.onSelectionChange.count}, in 'onSelectionChange': ${selectedItemId}`)

    //  Debounce selections to avoid the erratic re-render behavior caused by dynamically changing the list items.

    const now = Date.now()
    if (now - selectedAt.current < 25) return
    selectedAt.current = now

    setSelectedItemId(selectedItemId)
}
