/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { debug, shouldShowDebug } from "../../shared/TEMP"

export function onSelectionChange({
    selectedItemId,
    selectedAt,

    setSelectedItemId,
    searchTextLocked,
    setSearchTextLocked
}: {
    selectedItemId: string | null
    selectedAt: MutableRefObject<number>

    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    searchTextLocked: boolean
    setSearchTextLocked: Dispatch<SetStateAction<boolean>>
}): void {
    if (!selectedItemId) throw new Error("'Null' item selected - handle this edge case.")

    debug.state.onSelectionChange.count++
    if (shouldShowDebug({ for: "onSelectionChange" }))
        console.log(`#${debug.state.onSelectionChange.count}, in 'onSelectionChange': ${selectedItemId}`)

    const now = Date.now()
    if (now - selectedAt.current < 25) return
    selectedAt.current = now

    setSelectedItemId(selectedItemId)
    if (searchTextLocked) setSearchTextLocked(false)
}
