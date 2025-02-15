/**
 *
 */

import { SafeDataColumn } from "../../../definitions"
import { configureDataConstraint } from "../../../definitions/constraints"
import { dataTypes } from "../../../definitions/types"
import { DataValidationError, DataValidationResult } from "./store"
import { validateType } from "./type"

export function validateDataColumn({ value, column }: { value: string; column: SafeDataColumn }): DataValidationResult {
    const requiredError =
        column.required && !value.length
            ? {
                  title: "Required",
                  message: "This value is required."
              }
            : undefined

    if (column.required && requiredError) return { success: false, errors: [requiredError] }

    if (!column.required && !value.length) return { success: true, errors: null }

    const typeError = !validateType({ id: column.type, value })
        ? Object.values(dataTypes).find(type => type.id === column.type)?.info.error
        : undefined

    // fix data rule error key conflict
    if (typeError)
        return {
            success: false,
            errors: [
                {
                    title: typeError.title,
                    message: typeof typeError.message === "function" ? typeError.message(column) : typeError.message
                }
            ]
        }

    const ruleErrors = column?.constraints?.reduce((store, constraint) => {
        const { error, validate } = configureDataConstraint({ constraint })

        if (validate({ value })) return store
        return [...store, error]
    }, [] as DataValidationError[])

    if (ruleErrors?.length) return { success: false, errors: ruleErrors }

    return { success: true, errors: null }
}
