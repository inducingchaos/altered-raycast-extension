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
        label: "Out of Range",
        description: "The value must be equal to or greater than 0."
    },

    types: [dataTypes.number.id]
}
