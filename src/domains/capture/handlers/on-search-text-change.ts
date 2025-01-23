/**
 *
 */

import { debug, shouldShowDebug } from "../../shared/TEMP"

export function onSearchTextChange({
    searchText,
    setSearchText
}: {
    searchText: string
    setSearchText: (text: string) => void
}): void {
    debug.state.onSearchTextChange.count++
    if (shouldShowDebug({ for: "onSearchTextChange" }))
        console.log(`#${debug.state.onSearchTextChange.count}, in 'onSearchTextChange': ${searchText}`)

    setSearchText(searchText)
}
