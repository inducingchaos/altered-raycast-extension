/**
 *
 */

import { Dispatch, SetStateAction } from "react"
import { SafeDataColumn } from "~/domains/shared/data"
import { DataStore } from "../../../../../capture"
import { validateDataColumn } from "./column"

export function validateStore({
    columns,
    dataStore,
    setDataStore
}: {
    columns: SafeDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
}): boolean {
    const { success } = columns.reduce(
        (result, column) => {
            const state = dataStore.get(column.id)

            const { success, errors } = validateDataColumn({
                value: state?.value ?? column.default ?? "",
                column
            })

            setDataStore(prev =>
                new Map(prev).set(column.id, {
                    value: state?.value ?? column.default ?? "",
                    errors: errors
                })
            )

            if (result.success) return { success }
            else return result
        },
        { success: true }
    )

    return success
}
