/**
 *
 */

import { Dispatch, SetStateAction } from "react"
import { DataStore } from "../../../../../capture"
import { SerializableDataColumn } from "../../../definitions"
import { validateDataColumn } from "./column"

export function validateStore({
    columns,
    dataStore,
    setDataStore
}: {
    columns: SerializableDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
}): boolean {
    const { success } = columns.reduce(
        (result, column) => {
            const state = dataStore.get(column.id)

            const { success, errors } = validateDataColumn({
                value: state?.value ?? "",
                column
            })

            setDataStore(prev =>
                new Map(prev).set(column.id, {
                    value: state?.value ?? "",
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
