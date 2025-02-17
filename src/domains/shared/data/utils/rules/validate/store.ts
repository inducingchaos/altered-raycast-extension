/**
 *
 */

import { CaptureContextState } from "~/domains/capture/components/context/state"
import { SafeDataColumn } from "~/domains/shared/data"
import { validateDataColumn } from "./column"

export type DataValidationError = { title: string; message: string; metadata: Record<string, string> }

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
    state
}: {
    columns: SafeDataColumn[]
    state: CaptureContextState["state"]
}): DataValidationResult {
    const result = columns.reduce<DataValidationResult>(
        (acc, column) => {
            const current = state.store.value.get(column.id)

            const { success, errors } = validateDataColumn({
                value: current?.value ?? column.default ?? "",
                column
            })

            state.store.set(prev =>
                new Map(prev).set(column.id, {
                    value: current?.value ?? column.default ?? "",
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
