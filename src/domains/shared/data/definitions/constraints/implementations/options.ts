/**
 *
 */

import { createDataConstraint } from ".."
import { navigateArray } from "@sdkit/utils"

import { Type, type } from "arktype"

export type DataConstraintOption<DataType extends Type, InnerDataType extends Type> = {
    name: string
    description: string
    required: boolean
} & (
    | {
          type: "group"
          options: DataConstraintOptions<InnerDataType>
      }
    | {
          type: "value"
          schema: DataType
          default?: DataType["infer"]
      }
)

export type DataConstraintOptions<DataType extends Type, InnerDataType extends Type = Type> = Record<
    string,
    DataConstraintOption<DataType, InnerDataType>
>

function createDataConstraintOptions<DataType extends Type, InnerDataType extends Type>(
    props: DataConstraintOptions<DataType, InnerDataType>
): DataConstraintOptions<DataType, InnerDataType> {
    return props
}

export const test = createDataConstraintOptions({
    test: {
        name: "GOOD: Works as Intended",
        description: "`default` should error on `false`, as it is correctly inferred as a string.",
        type: "value",
        required: true,

        schema: type("string"),
        default: false
    },
    siblingTest: {
        name: "BAD: Inherits `DataType` generic from `test`",
        description: "`schema` should not error, and `default` should not be inferred as a string.",
        type: "value",
        required: true,

        schema: type("boolean"),
        default: true
    },
    groupTest: {
        name: "GOOD: Works as Intended",
        description: "Groups allow nested options.",
        type: "group",
        required: true,

        options: {
            nestedTest: {
                name: "GOOD: Works as Intended",
                description: '`default` should error on `"test"`, as it is correctly inferred as a boolean.',
                type: "value",
                required: true,

                schema: type("boolean"),
                default: "test"
            },

            nestedSiblingTest: {
                name: "BAD: Inherits `DataType` generic from `nestedTest`",
                description: "`schema` should not error, and `default` should not be inferred as a boolean.",
                type: "value",
                required: true,

                schema: type("number"),
                default: 1
            }
        }
    }
})

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
