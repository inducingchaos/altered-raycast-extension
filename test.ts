/**
 *
 */

import { type, Type } from "arktype"

//  Drop-in replacement to mock the behavior of an ArkType `Type`, for demonstration purposes.

//  Types for the `DataConstraint` parameter configurations.

//  The core constraint configuration.

//  The implementation.

export const enumConstraintConfig = createDataConstraint({
    name: "Enum",
    type: createTypeSchema("string"),
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
    label: ({ config, params }) => `${config.name}: ${params.options.join(", ")}`,
    instructions: ({ config, params }) =>
        `The value can contain ${params.multipleOptions?.limit ? `up to ${params.multipleOptions?.limit}` : params.multipleOptions?.limit === 1 ? "one" : "any"} of the following options${params.multipleOptions?.limit ? `, separated by '${(params.multipleOptions?.separators ?? config.params.multipleOptions.options.separators.default).join("', '")}'` : ""}: ${params.options.join(", ")}`,
    validate:
        ({ config, params }) =>
        value => {
            const separators = params.multipleOptions?.separators ?? config.params.multipleOptions.options.separators.default
            const options = separators.flatMap(separator => value.split(separator))
            const casedOptions = params.caseSensitive ? options : options.map(option => option.toLowerCase())

            const allowedOptions = params.options
            const casedAllowedOptions = params.caseSensitive
                ? allowedOptions
                : allowedOptions.map(option => option.toLowerCase())

            const isMatching = casedOptions.every(option => casedAllowedOptions.includes(option))

            const limit = params.multipleOptions?.limit ?? config.params.multipleOptions.options.limit.default
            const isLimitReached = !!limit && options.length > limit

            return isMatching && !isLimitReached
        }
})
