/**
 *
 */

import { Dispatch, SetStateAction } from "react"
import { SafeDataColumn } from "~/domains/shared/data"
import { DataStore } from "../../../../../capture"
import { validateDataColumn } from "./column"

export type DataValidationError = { title: string; message: string }

export type DataValidationResult =
    | {
          success: true
          errors: null
      }
    | {
          success: false
          errors: DataValidationError[]
      }

export function validateStore({
    columns,
    dataStore,
    setDataStore
}: {
    columns: SafeDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
}): DataValidationResult {
    const result = columns.reduce<DataValidationResult>(
        (acc, column) => {
            const state = dataStore.get(column.id)

            const { success, errors } = validateDataColumn({
                value: state?.value ?? column.default ?? "",
                column
            })

            setDataStore(prev =>
                new Map(prev).set(column.id, {
                    value: state?.value ?? column.default ?? "",
                    errors: errors ?? []
                })
            )

            // If we already have a failure, just accumulate errors
            if (!acc.success) {
                return {
                    success: false,
                    errors: [...acc.errors, ...(errors ?? [])]
                }
            }

            // If this validation failed, transition to failure state
            if (!success) {
                return {
                    success: false,
                    errors: errors
                }
            }

            // Stay in success state
            return acc
        },
        { success: true, errors: null }
    )

    return result
}
