/**
 *
 */

import { Type, type } from "arktype"
import { createDataConstraint } from ".."
import { navigateArray } from "@sdkit/utils"

type Base<T extends Type = Type> = {
    s: T
    n: T["infer"]
}

// type Example = Base & Partial<{ [key: string]: Example }>

function createBase<T extends Type>(props: Base<T>): Base<T> {
    return props
}

const test = createBase({
    s: type("boolean"),
    n: ""
})

export type DataConstraintOption<Schema extends Type = Type, X extends Type = Type> = {
    name: string
    description: string
    required: boolean
} & (
    | {
          type: "group"
          options: DataConstraintOptions<X>
      }
    | {
          type: "value"
          schema: Schema
          default?: Schema["infer"]
      }
)

export type DataConstraintOptions<Schema extends Type = Type, X extends Type = Type> = Record<
    string,
    DataConstraintOption<Schema, X>
>

//
//

function createDataConstraintOptionsWorking<Schema extends Type, X extends Type>(
    props: DataConstraintOptions<Schema, X>
): DataConstraintOptions<Schema, X> {
    return props
}

const test = createDataConstraintOptionsWorking({
    test: {
        name: "Test",
        description: "The test option.",
        required: true,

        type: "value",
        schema: type("string"),
        default: false
    },
    test2: {
        name: "Test",
        description: "The test option.",
        required: true,

        type: "value",
        schema: type("number"),
        default: true
    },
    values: {
        name: "Values",
        description: "The allowed options.",
        required: true,

        type: "group",

        options: {
            a: {
                name: "A",
                description: "The allowed options.",
                required: true,

                type: "value",
                schema: type("boolean"),
                default: "test"
            },

            b: {
                name: "B",
                description: "The allowed options.",
                required: true,

                type: "value",
                schema: type("number"),
                default: 1
            }
        }
    }
})

//
// SIMPLE VARIADIC RECORD

type VariadicRecord<Schemas extends Type, Key extends string = string> = {
    [key in Key]: InnerVariadicRecord<Schemas>
}

type InnerVariadicRecord<Schemas extends Type> = {
    c: Schemas
    d: Schemas["infer"]
    nested?: VariadicRecord<Schemas>
}

function createVariadicRecord<Schema extends Type>(props: VariadicRecord<Schema>): VariadicRecord<Schema> {
    return props
}

function constraintOption<Schema extends Type>(props: InnerVariadicRecord<Schema>) {
    return props
}

// function createVariadicRecord<Schemas extends Array<Type>>(
//     cons: VariadicRecord<[...Schemas]>
// ): {
//     [K in keyof Schemas]: Schemas[K] extends Type ? Schemas[K] : never
// }
// function createVariadicRecord(cons: VariadicRecord<Type[]>): unknown[] {
//     return cons
// }

const Test2 = createVariadicRecord({
    a: constraintOption({
        c: type("boolean"),
        // infer d from c, individually
        d: false
    }),
    b: constraintOption({
        c: type("number"),
        d: 5,
        nested: {
            x: constraintOption({
                c: type("string"),
                d: true
            }),
            y: constraintOption({
                c: type("boolean"),
                d: false,
                nested: {
                    z: constraintOption({
                        c: type("number"),
                        d: "10"
                    }),
                    z2: constraintOption({
                        c: type("string"),
                        d: false
                    })
                }
            })
        }
    })
})

//
//
type Wrapper<Options extends DataConstraintOptions = DataConstraintOptions> = {
    wrapper: Options
}

function createDataConstraintOptions<Options extends DataConstraintOptions = DataConstraintOptions>(
    props: Wrapper<Options>
): Wrapper<Options> {
    return props
}

const test = createDataConstraintOptions({
    wrapper: {
        values: {
            name: "Values",
            description: "The allowed options.",
            required: true,

            type: "group",

            options: {
                a: {
                    name: "A",
                    description: "The allowed options.",
                    required: true,

                    type: "value",
                    schema: type("boolean"),
                    default: false
                },

                b: {
                    name: "B",
                    description: "The allowed options.",
                    required: true,

                    type: "value",
                    schema: type("number"),
                    default: "false"
                }
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
