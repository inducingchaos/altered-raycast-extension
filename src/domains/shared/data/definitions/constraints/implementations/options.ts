/**
 *
 */

import { createTypeSchema, navigateArray } from "@sdkit/utils"
import { createDataConstraint } from "../definitions"
import { THIN_PIPE } from "~/domains/shared/utils"

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

    label: ({ params }) => `${params.options.join(` ${THIN_PIPE} `)}`,

    // add typing to resolve optional `constraint.params` in future
    instructions: ({ constraint, params: { multipleOptions, options } }) =>
        `The value can contain ${multipleOptions?.limit ? `up to ${multipleOptions?.limit}` : multipleOptions?.limit === 1 ? "one" : "any"} of the following options${multipleOptions?.limit ? `, separated by '${(multipleOptions?.separators ?? constraint.params!.multipleOptions.options.separators.default).join("', '")}'` : ""}: ${options.join(", ")}`,
    error: { label: "Invalid Option" },

    types: ["string", "number"],
    supersedes: [],

    params: {
        options: {
            name: "Options",
            description: "The allowed options for the value. ",
            type: "value",
            required: true,
            schema: createTypeSchema("string[]")
        },
        caseSensitive: {
            name: "Case Sensitive",
            description: "Whether the options should be case sensitive.",
            type: "value",
            required: false,
            schema: createTypeSchema("boolean"),
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
                    schema: createTypeSchema("number"),
                    default: 1
                },
                separators: {
                    name: "Separators",
                    description: "The allowed delimiters for separating the options.",
                    type: "value",
                    required: false,
                    schema: createTypeSchema("string[]"),
                    default: [", ", " "]
                }
            }
        }
    },

    select: ({ value, params, direction }) => {
        return navigateArray({
            source: params.options,
            current: item => item === value,
            direction
        })
    },

    validate: ({ value: initialValue, constraint, params }) => {
        const isNumber = typeof initialValue === "number"
        const value = isNumber ? initialValue.toString() : initialValue

        const separators = params.multipleOptions?.separators ?? constraint.params!.multipleOptions.options.separators.default
        const options = separators.reduce((acc, separator) => acc.flatMap(str => str.split(separator)), [value])
        const casedOptions = params.caseSensitive ? options : options.map(option => option.toLowerCase())

        const allowedOptions = params.options
        const casedAllowedOptions = params.caseSensitive ? allowedOptions : allowedOptions.map(option => option.toLowerCase())

        const isMatching = casedOptions.every(option => casedAllowedOptions.includes(option))

        const limit = params.multipleOptions?.limit ?? constraint.params!.multipleOptions.options.limit.default
        const isLimitReached = !!limit && options.length > limit

        console.log({ isMatching, isLimitReached, value, options, allowedOptions })

        return isMatching && !isLimitReached
    }
})
