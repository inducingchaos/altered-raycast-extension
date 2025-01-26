/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { debug, shouldShowDebug } from "../../shared/TEMP"
import { DataStore } from "../types"
import { DataRuleError, dataTypes, SerializableDataColumn } from "../../shared/data/definitions"
import { validateRule, validateType } from "../../shared/data/utils"

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
        const typeError = !validateType({ id: selectedColumn.type, value: searchText })
            ? dataTypes[selectedColumn.type].error
            : undefined

        const ruleErrors = selectedColumn?.rules.reduce((store, rule) => {
            if (validateRule({ id: rule.id, value: searchText })) return store
            return [...store, rule.error]
        }, [] as DataRuleError[])

        const errors = typeError ? [typeError] : ruleErrors

        setDataStore(prev =>
            new Map(prev).set(selectedColumn.id, {
                value: searchText,
                errors: errors
            })
        )
        dataStoreUpdatedAt.current = Date.now()
    }
}
