/**
 *
 */

import { Dispatch, SetStateAction } from "react"
import { debug, shouldShowDebug } from "../../shared/TEMP"
import { DataStore } from "../types"
import { DataRuleError, SerializableDataColumn } from "../../shared/data/definitions"
import { validate } from "../../shared/data/utils"

export function onSearchTextChange({
    searchText,
    selectedColumn,
    setDataStore
}: {
    searchText: string
    selectedColumn: SerializableDataColumn | undefined
    setDataStore: Dispatch<SetStateAction<DataStore>>
}): void {
    debug.state.onSearchTextChange.count++
    if (shouldShowDebug({ for: "onSearchTextChange" }))
        console.log(`#${debug.state.onSearchTextChange.count}, in 'onSearchTextChange': ${searchText}`)

    const errors = selectedColumn
        ? selectedColumn?.rules.reduce((store, rule) => {
              if (validate({ rule, value: searchText })) return store
              return [...store, rule.error]
          }, [] as DataRuleError[])
        : []

    if (selectedColumn)
        setDataStore(prev =>
            new Map(prev).set(selectedColumn.id, {
                value: searchText,
                errors: errors
            })
        )
}
