/**
 *
 */

import { SerializableDataColumn } from "../../../definitions/columns"
import { DataRuleError } from "../../../definitions/rule"
import { dataTypes } from "../../../definitions/types"
import { validateRule } from "./rule"
import { validateType } from "./type"

export function validateDataColumn({ value, column }: { value: string; column: SerializableDataColumn }): {
    success: boolean
    errors: DataRuleError[]
} {
    const requiredError =
        column.required && !value.length
            ? {
                  label: "Required",
                  description: "This value is required."
              }
            : undefined

    if (column.required && requiredError) return { success: false, errors: [requiredError] }

    if (!column.required && !value.length) return { success: true, errors: [] }

    const typeError = !validateType({ id: column.type, value })
        ? Object.values(dataTypes).find(type => type.id === column.type)?.info.error
        : undefined

    // fix data rule error key conflict
    if (typeError)
        return {
            success: false,
            errors: [
                {
                    label: typeError.title,
                    description: typeError.message
                }
            ]
        }

    const ruleErrors = column?.rules?.reduce((store, rule) => {
        if (validateRule({ id: rule.id, value })) return store
        return [...store, rule.error]
    }, [] as DataRuleError[])

    return { success: !ruleErrors?.length, errors: ruleErrors ?? [] }
}
