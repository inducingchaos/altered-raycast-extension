/**
 *
 */

import { type } from "arktype"
import { createDataConstraint } from ".."

export const minLengthConstraint = createDataConstraint({
    id: "min-length",
    name: "Min Length",
    description: "The minimum length of the value.",
    label: options => {
        return `Min Length: ${options.value}`
    },
    instructions: options => `The value must be ${options.value} characters or more.`,
    error: {
        label: "Exceeds Range"
    },

    types: ["string"],
    supersedes: [],

    options: {
        value: {
            type: "value",
            name: "Value",
            description: "The minimum length of the value.",

            required: true,
            schema: type("number")
        }
    },

    validate: ({ value, params }) => {
        const schema = type(`string >= ${params.value}`)
        const result = schema(value)

        if (result instanceof type.errors) {
            console.error(result)
            return false
        }

        return true
    }
})
