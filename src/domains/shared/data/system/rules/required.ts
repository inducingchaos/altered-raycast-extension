/**
 *
 */

import { nanoid } from "nanoid"
import { DataRule } from "../../definitions/rule"
import { dataTypeIDs } from "../../definitions/type"

// spell-checker: disable

export const requiredRule: DataRule = {
    id: nanoid(),
    name: "Required",
    description: "This value is required.",
    error: {
        label: "Required",
        description: "This value is required."
    },

    types: [...dataTypeIDs]
}
