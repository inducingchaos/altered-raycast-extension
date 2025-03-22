/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { SafeDataColumn } from "~/domains/shared/data"
import { validateDataColumn } from "~/domains/shared/data/utils"
import { debug, shouldShowDebug } from "~/domains/shared/TEMP"
import { DataStore } from "../types"

export function setContent({
    searchText,
    selectedColumn,
    setDataStore,
    dataStoreUpdatedAt
}: {
    searchText: string
    selectedColumn: SafeDataColumn | undefined
    setDataStore: Dispatch<SetStateAction<DataStore>>
    dataStoreUpdatedAt: MutableRefObject<number | undefined>
}): void {
    debug.state.onSearchTextChange.count++
    if (shouldShowDebug({ for: "onSearchTextChange" }))
        // console.log(`#${debug.state.onSearchTextChange.count}, in 'onSearchTextChange': ${searchText}`)

        /**
         * This is necessary to avoid the content being involuntarily set by Raycast upon initialization.
         */
        const canUpdate = dataStoreUpdatedAt.current || searchText.length > 0

    if (selectedColumn && canUpdate) {
        const { errors } = validateDataColumn({ value: searchText, column: selectedColumn })

        setDataStore(prev =>
            new Map(prev).set(selectedColumn.id, {
                value: searchText,
                errors: errors ?? []
            })
        )
        dataStoreUpdatedAt.current = Date.now()
    }
}
