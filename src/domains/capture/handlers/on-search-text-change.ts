/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { SerializableDataColumn } from "../../shared/data/definitions"
import { validateDataColumn } from "../../shared/data/utils"
import { debug, shouldShowDebug } from "../../shared/TEMP"
import { DataStore } from "../types"

export function onSearchTextChange({
    searchText,
    selectedColumn,
    setDataStore,
    dataStoreUpdatedAt
}: {
    searchText: string
    selectedColumn: SerializableDataColumn | undefined
    setDataStore: Dispatch<SetStateAction<DataStore>>
    dataStoreUpdatedAt: MutableRefObject<number | undefined>
}): void {
    debug.state.onSearchTextChange.count++
    if (shouldShowDebug({ for: "onSearchTextChange" }))
        console.log(`#${debug.state.onSearchTextChange.count}, in 'onSearchTextChange': ${searchText}`)

    const canUpdate = dataStoreUpdatedAt.current || searchText.length > 0

    if (selectedColumn && canUpdate) {
        const { errors } = validateDataColumn({ value: searchText, column: selectedColumn })

        setDataStore(prev =>
            new Map(prev).set(selectedColumn.id, {
                value: searchText,
                errors: errors
            })
        )
        dataStoreUpdatedAt.current = Date.now()
    }
}
