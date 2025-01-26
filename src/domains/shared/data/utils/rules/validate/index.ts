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

export const validate = ({ rule, value }: { rule: DataRule; value: string | undefined }): boolean => {
    const systemRules = [requiredRule, maxLength255Rule, min0Rule, max10Rule]
    if (!systemRules.some(systemRule => systemRule.id === rule.id)) throw new Error(`Rule ${rule.id} not found`)

    if (rule.id === requiredRule.id) return validateRequiredRule(value)
    if (rule.id === maxLength255Rule.id) return validateMaxLength255Rule(value)
    if (rule.id === min0Rule.id) return validateMin0Rule(value)
    if (rule.id === max10Rule.id) return validateMax10Rule(value)

    return false
}
