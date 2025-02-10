/**
 *
 */

// spell-checker: disable

import { z, ZodSchema, SafeParseReturnType } from "zod"
import { DataType } from "../types"
import { Type, type } from "arktype"

export const dataConstraintUids = {
    "min-length": "x_TXxF1Ver4jz9prlbgBc",
    "max-length": "-PWkRT-ZEndaHTRZtQLrl",

    "min-value": "mNg5N_8JHaHFKNBcpI8qS",
    "max-value": "CJ8vywlYpE90X5u9uR48w",

    range: "3Ilbtz7WRBP77q8zU3iyw"
} as const
export const dataConstraintIds = Object.keys(dataConstraintUids)
export type DataConstraintID = keyof typeof dataConstraintUids

export type DataConstraint<Options extends DataConstraintOptions = DataConstraintOptions, T extends Type = Type> = {
    type: "constraint"

    id: DataConstraintID
    name: string
    description: string | ((options: InferSchemaFromOptions<Options>) => string)

    label: string | ((options: InferSchemaFromOptions<Options>) => string)
    instructions?: string | ((options: InferSchemaFromOptions<Options>) => string)
    error?: {
        label?: string | ((options: InferSchemaFromOptions<Options>) => string)
        description?: string | ((options: InferSchemaFromOptions<Options>) => string)
    }

    types: DataType["id"][]
    supersedes: DataConstraintID[]
    options: Options

    testOptions: T

    validate: (options: InferSchemaFromOptions<Options>) => (value: string) => SafeParseReturnType<ZodSchema, unknown>
}

// Helper function to create constraints with proper typing
export function createDataConstraint<Options extends Record<string, DataConstraintOption>>(
    props: Omit<DataConstraint<Options>, "type">
) {
    return { type: "constraint" as const, ...props }
}

export const dataConstraints = {
    range: createDataConstraint({
        id: "range",
        name: "Range",
        description: "The range of the value.",
        label: options => {
            return `Range: ${options.min}-${options.max}${options.step?.value ? `, Step: ${options.step.value}` : ""}`
        },
        instructions: options =>
            `The value must be between ${options.min} and ${options.max}${
                options.step?.value ? `, with a step of ${options.step.value}` : ""
            }.`,
        error: {
            label: "Exceeds Range"
        },

        types: ["number"],
        supersedes: ["min-value", "max-value"],

        testOptions: type("number"),

        // options: {
        //     min: {
        //         type: "value",
        //         name: "Minimum",
        //         description: "The minimum value allowed.",
        //         schema: type("number")
        //     },
        //     max: {
        //         type: "value",
        //         name: "Maximum",
        //         description: "The maximum value allowed.",
        //         schema: type("number")
        //     },
        //     step: {
        //         type: "group",
        //         name: "Step",
        //         description: "Configure stepping behavior for the range.",
        //         options: {
        //             value: {
        //                 type: "value",
        //                 name: "Step Value",
        //                 description: "The increment between allowed values.",
        //                 schema: type("number | undefined")
        //             },
        //             offset: {
        //                 type: "value",
        //                 name: "Step Offset",
        //                 description: "The starting point for step calculations.",
        //                 schema: type("number | undefined")
        //             }
        //         }
        //     }
        // },
        validate: options => value => {
            const offset = options.step?.offset ?? 0
            return z
                .number({ coerce: true })
                .min(options.min - offset)
                .max(options.max - offset)
                .step(options.step?.value ?? 1)
                .safeParse(Number(value) - offset)
        }
    })
} as const

// This stuff was for type inference for the config object before we made it recursive and partially literal instead of an entire ZodSchema.

// This is a test

// type T = (typeof dataConstraints.range.testOptions)["infer"]

//  This type will need to be adapted for the following

// export type DataConstraintConfigOptions<
//     ID extends DataConstraintID,
//     CamelCaseID extends CamelCaseDataConstraintID = KebabCaseToCamelCase<ID>,
//     Constraint extends DataConstraint = (typeof dataConstraints)[CamelCaseID],
//     OptionsSchema = Constraint["optionsSchema"]
// > = OptionsSchema extends ZodSchema ? z.infer<OptionsSchema> : never

//  This defines the inferred config shape and details needed.

// export type DataConstraintConfig<ID extends DataConstraintID = DataConstraintID> = {
//     id: ID
//     options: DataConstraintConfigOptions<ID>
// }

// Helper to force TypeScript to simplify complex types
type Simplify<T> = { [K in keyof T]: T[K] } & {}

// Recursive types as before
export type DataConstraintOption<Schema extends Type = Type> = {
    name: string
    description: string
} & (
    | {
          type: "group"
          options: DataConstraintOptions<Schema>
      }
    | {
          type: "value"
          schema: Schema
      }
)

export type DataConstraintOptions<Schema extends Type = Type> = Record<string, DataConstraintOption<Schema>>

function createDataConstraint2<T extends DataConstraintOptions<U>, U extends Type>(options: T): T {
    return options
}

const dataConstraint2 = createDataConstraint2({
    min: {
        type: "value",
        name: "Minimum",
        description: "The minimum value allowed.",
        schema: type("number")
    },
    max: {
        type: "value",
        name: "Maximum",
        description: "The maximum value allowed.",
        schema: type("number")
    },
    step: {
        type: "group",
        name: "Step",
        description: "Configure stepping behavior for the range.",
        options: {
            value: {
                type: "value",
                name: "Step Value",
                description: "The increment between allowed values.",
                schema: type("number | undefined")
            },
            offset: {
                type: "value",
                name: "Step Offset",
                description: "The starting point for step calculations.",
                schema: type("number | undefined")
            }
        }
    }
})

type InferSchemaFromOptions<T extends DataConstraintOptions<Type>> = {
    [Key in keyof T]: T[Key] extends { type: "value"; schema: Type }
        ? T[Key]["schema"]["infer"]
        : T[Key] extends { type: "group"; options: infer GroupOptions }
          ? InferSchemaFromOptions<GroupOptions & DataConstraintOptions<Type>>
          : never
}

type InferredSchema = InferSchemaFromOptions<typeof dataConstraint2>

function test(props: InferredSchema): boolean {
    return props.step.offset
}
