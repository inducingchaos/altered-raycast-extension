/**
 * COPIED FROM CAPTURE
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"

export function changeSelection({
    selectedItemId,
    setSelectedItemId,
    selectedItemIdUpdatedAt
}: {
    selectedItemId: string | null
    setSelectedItemId: Dispatch<SetStateAction<string | null>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>
}): void {
    if (!selectedItemId) throw new Error("'Null' item selected - handle this edge case.")

    // we really shouldn't need this - again this is caused by the "onSelectionChange" detecting our manual selection and re-selecting the PREV item because using stale state (maybe using a ref would fix this? - but wouldn't trigger a re-render?)
    // THIS was introduced to the Find cmd when we added the drag-select feature - had to increase from 50 -150
    //  It works for now, but selection is slow. Either fix or consult with Raycast devs.
    //  POSSIBLE SOLUTION: create other ref/state as "intentionalSelection" and only run the "List" onSelectionChange if intentionalSelection is true (how to differentiate tho?) - consult with Raycast first.

    const now = Date.now()
    if (selectedItemIdUpdatedAt.current && now - selectedItemIdUpdatedAt.current < 150) return
    selectedItemIdUpdatedAt.current = now

    setSelectedItemId(selectedItemId)
}
