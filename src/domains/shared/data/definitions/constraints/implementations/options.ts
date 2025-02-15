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
    // label: options => `${options.values.join(" ｜ ")}`,
    // instructions: options =>
    //     `The value must be one of the following: '${options.values.slice(0, -1).join("', '")}', or '${options.values[options.values.length - 1]}'.`,

    label: ({ constraint, params }) => `${constraint.name}: ${params.options.join(", ")}`,
    instructions: ({ constraint, params }) =>
        `The value can contain ${params.multipleOptions?.limit ? `up to ${params.multipleOptions?.limit}` : params.multipleOptions?.limit === 1 ? "one" : "any"} of the following options${params.multipleOptions?.limit ? `, separated by '${(params.multipleOptions?.separators ?? constraint.params.multipleOptions.options.separators.default).join("', '")}'` : ""}: ${params.options.join(", ")}`,
    error: {
        label: "Invalid Option"
    },

    types: ["string"],
    supersedes: [],

    params: {
        options: {
            name: "Options",
            description: "The allowed options for the value. ",
            type: "value",
            required: true,
            schema: createDynamicType("string[]")
        },
        caseSensitive: {
            name: "Case Sensitive",
            description: "Whether the options should be case sensitive.",
            type: "value",
            required: false,
            schema: createDynamicType("boolean"),
            default: true
        },
        multipleOptions: {
            name: "Multiple Options",
            description: "Whether more than one option can be specified.",
            type: "group",
            required: false,
            options: {
                limit: {
                    name: "Limit",
                    description: "The maximum number of options that can be specified.",
                    type: "value",
                    required: false,
                    schema: createDynamicType("number"),
                    default: 1
                },
                separators: {
                    name: "Separators",
                    description: "The allowed delimiters for separating the options.",
                    type: "value",
                    required: false,
                    schema: createDynamicType("string[]"),
                    default: [", ", " "]
                }
            }
        }
    },

    select: ({ value, params, direction }) => {
        return navigateArray({
            source: params.values,
            current: item => item === value,
            direction
        })
    },

    validate:
        ({ constraint, params }) =>
        value => {
            const separators =
                params.multipleOptions?.separators ?? constraint.params.multipleOptions.options.separators.default
            const options = separators.flatMap(separator => value.split(separator))
            const casedOptions = params.caseSensitive ? options : options.map(option => option.toLowerCase())

            const allowedOptions = params.options
            const casedAllowedOptions = params.caseSensitive
                ? allowedOptions
                : allowedOptions.map(option => option.toLowerCase())

            const isMatching = casedOptions.every(option => casedAllowedOptions.includes(option))

            const limit = params.multipleOptions?.limit ?? constraint.params.multipleOptions.options.limit.default
            const isLimitReached = !!limit && options.length > limit

            return isMatching && !isLimitReached
        }
})
