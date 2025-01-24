/**
 *
 */

import { dataTypes } from "../../definitions"

// spell-checker: disable

export const max255Rule: DataRule = {
    id: "b4DZsnfImMMDnrOUOZJtG",
    name: "Max: 255",
    description: "Must be 255 characters or less.",
    error: {
        name: "Exceeds Limit"
    },

    type: dataTypes.string.id
}
