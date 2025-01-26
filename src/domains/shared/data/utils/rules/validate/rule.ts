/**
 *
 */

import { DataRule } from "../../../definitions/rule"
import {
    max10Rule,
    maxLength255Rule,
    min0Rule,
    validateMax10Rule,
    validateMaxLength255Rule,
    validateMin0Rule
} from "../../../system"
import { requiredRule, validateRequiredRule } from "../../../system/rules/required"

export const validateRule = ({ id, value }: { id: DataRule["id"]; value: string | undefined }): boolean => {
    const systemRules = [requiredRule, maxLength255Rule, min0Rule, max10Rule]
    if (!systemRules.some(systemRule => systemRule.id === id)) throw new Error(`Rule ${id} not found`)

    if (id === requiredRule.id) return validateRequiredRule(value)
    if (id === maxLength255Rule.id) return validateMaxLength255Rule(value)
    if (id === min0Rule.id) return validateMin0Rule(value)
    if (id === max10Rule.id) return validateMax10Rule(value)

    return false
}
