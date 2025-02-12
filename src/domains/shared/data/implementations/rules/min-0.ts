/**
 *
 */

import { nanoid } from "nanoid"
import { DataRule, dataTypes } from "../../definitions"

// spell-checker: disable

export const min0Rule: DataRule = {
    id: nanoid(),
    name: "Min: 0",
    description: "Minimum value of 0.",
    error: {
        label: "Exceeds Min",
        description: "The value must be equal to or greater than 0."
    },

    types: [dataTypes.number.id]
}

export const validateMin0Rule = (value: string | undefined): boolean => {
    if (value === undefined) return false

    const number = parseInt(value)
    if (isNaN(number)) return false

    return number >= 0
}
