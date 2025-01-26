/**
 *
 */

import { nanoid } from "nanoid"
import { DataRule, dataTypes } from "../../definitions"

// spell-checker: disable

export const maxLength255Rule: DataRule = {
    id: nanoid(),
    name: "Max Length: 255",
    description: "Must be 255 characters or less.",
    error: {
        label: "Exceeds Max Length",
        description: "The value must be 255 characters or less."
    },

    types: [dataTypes.string.id]
}
