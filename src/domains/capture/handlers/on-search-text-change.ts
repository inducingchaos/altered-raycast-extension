/**
 *
 */

import { Dispatch, SetStateAction } from "react"
import { debug, shouldShowDebug } from "../../shared/TEMP"
import { DataStore } from "../types"

export function onSearchTextChange({
    searchText,
    selectedItemId,
    setDataStore
}: {
    searchText: string
    selectedItemId: string | undefined
    setDataStore: Dispatch<SetStateAction<DataStore>>
}): void {
    debug.state.onSearchTextChange.count++
    if (shouldShowDebug({ for: "onSearchTextChange" }))
        console.log(`#${debug.state.onSearchTextChange.count}, in 'onSearchTextChange': ${searchText}`)

    //  @todo: Rule validation?

    if (selectedItemId)
        setDataStore(prev =>
            prev.set(selectedItemId, {
                value: searchText,
                errors: prev.get(selectedItemId)?.errors ?? []
            })
        )
}
