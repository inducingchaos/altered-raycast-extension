/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { debug, shouldShowDebug } from "../../shared/TEMP"
import { SafeDataSchema } from "../../shared/data/definitions"

export function changeSelection({
    schema,
    selectedItemId,
    setSelectedItemId,
    selectedItemIdUpdatedAt
}: {
    schema: SafeDataSchema
    selectedItemId: string | null
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>
}): void {
    if (!selectedItemId) throw new Error("'Null' item selected - handle this edge case.")

    debug.state.onSelectionChange.count++
    if (shouldShowDebug({ for: "onSelectionChange" }))
        console.log(
            `#${debug.state.onSelectionChange.count}, in 'onSelectionChange': ${schema.columns.find(column => column.id === selectedItemId)?.name}`
        )

    //  Debounce selections to avoid the erratic re-render behavior caused by dynamically changing the list items.

    const now = Date.now()
    if (selectedItemIdUpdatedAt.current && now - selectedItemIdUpdatedAt.current < 25) return
    selectedItemIdUpdatedAt.current = now

    setSelectedItemId(selectedItemId)
}
