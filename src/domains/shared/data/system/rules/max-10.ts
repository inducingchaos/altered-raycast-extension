/**
 *
 */

import { nanoid } from "nanoid"
import { DataRule, dataTypes } from "../../definitions"

// spell-checker: disable

export const max10Rule: DataRule = {
    id: nanoid(),
    name: "Max: 10",
    description: "Maximum value of 10.",
    error: {
        label: "Out of Range",
        description: "The value must be 10 or less."
    },

    types: [dataTypes.number.id]
}

export const validateMax10Rule = (value: string | undefined): boolean => {
    if (value === undefined) return false

    const number = parseInt(value)
    if (isNaN(number)) return false

    return number <= 10
}
