/**
 *
 */

import { createDataConstraint } from "../definitions"
import { createTypeSchema } from "@sdkit/utils"

export const lengthConstraint = createDataConstraint({
    id: "length",
    name: "Length",
    description: "The length of the value.",

    label: ({ params: { min, max } }) => {
        console.log("LOOKOUT 2", min, max)
        return `${min ? `Min: ${min}, ` : ""}${max ? `Max: ${max}, ` : ""}`
    },
    instructions: ({ params: { min, max } }) => {
        console.log("LOOKOUT 3", min, max)
        return `The value must be ${min ? `a minimum of ${min} characters` : ""} ${min && max ? "and" : ""} ${max ? `a maximum of ${max} characters` : ""} long.`
    },
    error: { label: "Invalid Length" },

    types: ["string"],
    supersedes: [],

    params: {
        //  Define relationships
        min: {
            type: "value",
            name: "Min Length",
            description: "The minimum length of the value.",

            required: false,
            schema: createTypeSchema("number")
        },
        max: {
            type: "value",
            name: "Max Length",
            description: "The maximum length of the value.",

            required: false,
            schema: createTypeSchema("number")
        }
    },

    validate: ({ params: { min, max }, value }) => {
        console.log("LOOKOUT", min, max, value)
        const length = value.length

        const isMinimumLength = min ? length >= min : true
        const isMaximumLength = max ? length <= max : true

        return isMinimumLength && isMaximumLength
    }
})
