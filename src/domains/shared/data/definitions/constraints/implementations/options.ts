/**
 *
 */

import { type } from "arktype"
import { createDataConstraint } from ".."
import { navigateArray } from "@sdkit/utils"

export const optionsConstraint = createDataConstraint({
    id: "options",
    name: "Options",
    description: "The allowed options for the value.",
    label: options => {
        return `Options: ${options.values.join(" | ")}`
    },
    instructions: options =>
        `The value must be one of the following: '${options.values?.slice(0, -1).join("', '")}', or '${options.values?.[options.values.length - 1]}'.`,
    error: {
        label: "Invalid Option"
    },

    types: ["string"],
    supersedes: [],

    options: {
        values: {
            type: "value",
            name: "Values",
            description: "The allowed options.",

            required: true,
            schema: type("string[]")
        }
    },

    select: ({ value, params, direction }) => {
        return navigateArray({
            source: params.values,
            current: item => item === value,
            direction
        })
    },

    validate: ({ value, params }) => {
        const schema = type.enumerated(params.values)
        const result = schema(value)

        if (result instanceof type.errors) {
            console.error(result)
            return false
        }

        return true
    }
})
