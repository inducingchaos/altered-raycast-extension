/**
 *
 */

import { navigateArray } from "@sdkit/utils"
import { type } from "arktype"
import { createDataConstraint } from ".."

export const optionsConstraint = createDataConstraint({
    id: "options",
    name: "Options",
    description: "The allowed options for the value.",
    // label: options =>
    //     `Options: ${options.values
    //         .map(value => `'${value}'`)
    //         .slice(0, -1)
    //         .join(", ")}, or ${options.values.map(value => `'${value}'`).slice(-1)[0]}`,
    label: options => `${options.values.join(" ｜ ")}`,
    instructions: options =>
        `The value must be one of the following: '${options.values.slice(0, -1).join("', '")}', or '${options.values[options.values.length - 1]}'.`,
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
        },
        caseSensitive: {
            type: "value",
            name: "Case Sensitive",
            description: "Whether the options are case sensitive.",

            required: false,

            schema: type("boolean"),
            default: "true"
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
