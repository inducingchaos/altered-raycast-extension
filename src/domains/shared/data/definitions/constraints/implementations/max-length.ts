/**
 *
 */

import { type } from "arktype"
import { createDataConstraint } from ".."

export const maxLengthConstraint = createDataConstraint({
    id: "max-length",
    name: "Max Length",
    description: "The maximum length of the value.",
    label: options => {
        return `Max Length: ${options.value}`
    },
    instructions: options => `The value must be ${options.value} characters or less.`,
    error: {
        label: "Exceeds Range"
    },

    types: ["string"],
    supersedes: [],

    options: {
        value: {
            type: "value",
            name: "Value",
            description: "The maximum length of the value.",

            required: true,
            schema: type("number")
        }
    },

    validate: (value, options) => {
        const schema = type(`string < ${options.value}`)
        const result = schema(value)

        if (result instanceof type.errors) {
            console.error(result)
            return false
        }

        return true
    }
})
