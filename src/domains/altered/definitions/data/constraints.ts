/**
 *
 */

import { z, ZodObject, ZodSchema, ZodType } from "zod"
import { KebabCaseToCamelCase } from "../../../sdkit/utils"
import { DataType } from "./types"

export const dataConstraintIds = ["required", "min-length", "max-length", "min-value", "max-value", "range"] as const

export type DataConstraintID = (typeof dataConstraintIds)[number]

export type DataConstraint<OptionsSchema extends ZodSchema, Options = z.infer<OptionsSchema>> = {
    id: DataConstraintID
    name: string
    description: string

    optionsSchema: OptionsSchema
    systemOnly: boolean
    forTypes: DataType["id"][]
    supersedes: DataConstraintID[]

    info: {
        label: string | ((options: Options) => string)
        description: string | ((options: Options) => string)

        error?: {
            label?: string | ((options: Options) => string)
            description?: string | ((options: Options) => string)
        }
    }
}

export function createDataConstraint<T extends ZodSchema>(props: DataConstraint<T>) {
    return props
}

// Internal definitions.

export const dataConstraints = {
    required: createDataConstraint({
        id: "required",
        name: "Required",
        description: "Whether or not the value is required.",

        optionsSchema: z.null(),
        systemOnly: true,
        forTypes: ["string", "number", "boolean"],
        supersedes: [],

        info: {
            label: "Required",
            description: "The content cannot be empty."
        }
    }),

    "min-length": createDataConstraint({
        id: "min-length",
        name: "Min Length",
        description: "The minimum length of the value.",

        optionsSchema: z.object({
            value: z.number({ coerce: true })
        }),
        systemOnly: false,
        forTypes: ["string"],
        supersedes: [],

        info: {
            label: (options: { value: number }) => `Min Length: ${options.value}`,
            description: (options: { value: number }) =>
                `The content must be at least ${options.value} character${options.value === 1 ? "" : "s"}.`,

            error: {
                label: "Too Short"
            }
        }
    }),

    "max-length": createDataConstraint({
        id: "max-length",
        name: "Max Length",
        description: "The maximum length of the value.",

        optionsSchema: z.object({
            value: z.number({ coerce: true })
        }),
        systemOnly: false,
        forTypes: ["string"],
        supersedes: [],

        info: {
            label: (options: { value: number }) => `Max Length: ${options.value}`,
            description: (options: { value: number }) =>
                `The content must be ${options.value} character${options.value === 1 ? "" : "s"} or less.`,

            error: {
                label: "Exceeds Max Length"
            }
        }
    }),

    "min-value": createDataConstraint({
        id: "min-value",
        name: "Min Value",
        description: "The minimum value.",

        optionsSchema: z.object({
            value: z.number({ coerce: true })
        }),
        systemOnly: false,
        forTypes: ["number"],
        supersedes: [],

        info: {
            label: (options: { value: number }) => `Min: ${options.value}`,
            description: (options: { value: number }) => `The value must be greater than or equal to ${options.value}.`,

            error: {
                label: "Below Min Value"
            }
        }
    }),
    "max-value": createDataConstraint({
        id: "max-value",
        name: "Max Value",
        description: "The maximum value.",
        optionsSchema: z.object({
            value: z.number({ coerce: true })
        }),
        systemOnly: false,
        forTypes: ["number"],
        supersedes: [],

        info: {
            label: (options: { value: number }) => `Max: ${options.value}`,
            description: (options: { value: number }) => `The value must be less than or equal to ${options.value}.`,
            error: {
                label: "Exceeds Max Value"
            }
        }
    }),
    range: createDataConstraint({
        name: "Range",
        description: "The range of the value.",

        params: {
            min: {
                name: "Min",
                description: "The minimum value.",
                schema: z.number({ coerce: true })
            },
            max: {
                name: "Max",
                description: "The maximum value.",
                schema: z.number({ coerce: true })
            },

            step: {
                name: "Step",
                description: "The step of the value.",
                schema: {
                    value: {
                        name: "Value",
                        description: "The value of the step.",
                        schema: z.number({ coerce: true }).optional()
                    },
                    offset: {
                        name: "Offset",
                        description: "The offset of the step. Defaults to the minimum range value.",
                        schema: z.number({ coerce: true }).optional()
                    }
                }
            }
        },
        systemOnly: false,
        forTypes: ["number"],
        supersedes: ["min-value", "max-value"],

        info: {
            label: (options: { min: number; max: number; step?: number }) =>
                `Range: ${options.min}-${options.max}${options.step ? `, Step: ${options.step}` : ""}`,
            description: (options: { min: number; max: number; step?: number }) =>
                `The value must be between ${options.min} and ${options.max}${options.step ? `, with a step of ${options.step}` : ""}.`,

            error: {
                label: "Exceeds Range"
            }
        },

        validate: (params: { min: number; max: number; interval?: { value?: number; origin?: number } }, value: number) =>
            z
                .number()
                .min(params.min - (params.interval?.origin ?? 0))
                .max(params.max - (params.interval?.origin ?? 0))
                .step(params.interval?.value ?? 1)
                .safeParse(value - (params.interval?.origin ?? 0))
    })
} as const

type T = typeof dataConstraints.range.optionsSchema

// export type DataConstraintConfigOptions<
//     ID extends DataConstraintID,
//     CamelCaseID extends CamelCaseDataConstraintID = KebabCaseToCamelCase<ID>,
//     Constraint extends DataConstraint = (typeof dataConstraints)[CamelCaseID],
//     OptionsSchema = Constraint["optionsSchema"]
// > = OptionsSchema extends ZodSchema ? z.infer<OptionsSchema> : never

// export type DataConstraintConfig<ID extends DataConstraintID = DataConstraintID> = {
//     id: ID
//     options: DataConstraintConfigOptions<ID>
// }

// // Configuration object.

// export const dataConstraintConfig: DataConstraintConfig = {
//     id: "max-length",
//     options: {
//         value: 255
//     }
// }

// For range, it should infer different options
const rangeConfig: DataConstraintConfig<"range"> = {
    id: "range",
    options: {
        min: 0,
        max: 100,
        step: 1 // optional
    }
}

/* EXAMPLE IMPLEMENTATION */

//  1. Get the constraint IDs

const constraintIds = dataConstraintIds

//  2. Get the parameters for the selected constraint

const selectedConstraintId: DataConstraintID = "range"
const dataConstraintParameters = [
    {
        id: "min",
        name: "Min",
        description: "The minimum value.",
        schema: z.number()
    },
    {
        id: "max",
        name: "Max",
        description: "The maximum value.",
        schema: z.number()
    },
    {
        id: "step",
        name: "Step",
        description: "The step value.",
        schema: z.number().optional()
    }
]

//  3. Assuming we get back the mapped and validated parameters, we can create the constraint

const constraint = dataConstraints[selectedConstraintId]

//  4. We can then use the constraint to validate the data

const data = 50
const isValid = constraint.optionsSchema.safeParse(data)
