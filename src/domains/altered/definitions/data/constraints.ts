// /**
//  *
//  */

// import { SafeParseReturnType, z, ZodObject, ZodParsedType, ZodSchema, ZodType } from "zod"
// import { KebabCaseToCamelCase } from "../../../sdkit/utils"
// import { DataType } from "./types"

// export const dataConstraintIds = ["required", "min-length", "max-length", "min-value", "max-value", "range"] as const

// export type DataConstraintID = (typeof dataConstraintIds)[number]

// export type DataConstraintOptions<OptionSchema extends ZodSchema = ZodSchema> = Record<
//     string,
//     {
//         name: string
//         description: string
//     } & (
//         | { options: DataConstraintOptions }
//         | {
//               schema: OptionSchema
//           }
//     )
// >

// export type DataConstraint<
//     OptionsSchema extends ZodSchema,
//     Options = z.infer<OptionsSchema>,
//     ValidateResult extends SafeParseReturnType<OptionsSchema, Options> = SafeParseReturnType<OptionsSchema, Options>
// > = {
//     id: DataConstraintID
//     name: string
//     description: string

//     optionsSchema: OptionsSchema
//     systemOnly: boolean
//     forTypes: DataType["id"][]
//     supersedes: DataConstraintID[]

//     info: {
//         label: string | ((options: Options) => string)
//         description: string | ((options: Options) => string)

//         error?: {
//             label?: string | ((options: Options) => string)
//             description?: string | ((options: Options) => string)
//         }
//     }

//     validate: (options: Options) => (value: string) => ValidateResult
// }

// export function createDataConstraint<T extends ZodSchema>(props: DataConstraint<T>) {
//     return props
// }

// // Internal definitions.

// export const dataConstraints = {
//     // required: createDataConstraint({
//     //     id: "required",
//     //     name: "Required",
//     //     description: "Whether or not the value is required.",

//     //     optionsSchema: z.null(),
//     //     systemOnly: true,
//     //     forTypes: ["string", "number", "boolean"],
//     //     supersedes: [],

//     //     info: {
//     //         label: "Required",
//     //         description: "The content cannot be empty."
//     //     }
//     // }),

//     // "min-length": createDataConstraint({
//     //     id: "min-length",
//     //     name: "Min Length",
//     //     description: "The minimum length of the value.",

//     //     optionsSchema: z.object({
//     //         value: z.number({ coerce: true })
//     //     }),
//     //     systemOnly: false,
//     //     forTypes: ["string"],
//     //     supersedes: [],

//     //     info: {
//     //         label: (options: { value: number }) => `Min Length: ${options.value}`,
//     //         description: (options: { value: number }) =>
//     //             `The content must be at least ${options.value} character${options.value === 1 ? "" : "s"}.`,

//     //         error: {
//     //             label: "Too Short"
//     //         }
//     //     }
//     // }),

//     // "max-length": createDataConstraint({
//     //     id: "max-length",
//     //     name: "Max Length",
//     //     description: "The maximum length of the value.",

//     //     optionsSchema: z.object({
//     //         value: z.number({ coerce: true })
//     //     }),
//     //     systemOnly: false,
//     //     forTypes: ["string"],
//     //     supersedes: [],

//     //     info: {
//     //         label: (options: { value: number }) => `Max Length: ${options.value}`,
//     //         description: (options: { value: number }) =>
//     //             `The content must be ${options.value} character${options.value === 1 ? "" : "s"} or less.`,

//     //         error: {
//     //             label: "Exceeds Max Length"
//     //         }
//     //     }
//     // }),

//     // "min-value": createDataConstraint({
//     //     id: "min-value",
//     //     name: "Min Value",
//     //     description: "The minimum value.",

//     //     optionsSchema: z.object({
//     //         value: z.number({ coerce: true })
//     //     }),
//     //     systemOnly: false,
//     //     forTypes: ["number"],
//     //     supersedes: [],

//     //     info: {
//     //         label: (options: { value: number }) => `Min: ${options.value}`,
//     //         description: (options: { value: number }) => `The value must be greater than or equal to ${options.value}.`,

//     //         error: {
//     //             label: "Below Min Value"
//     //         }
//     //     }
//     // }),
//     // "max-value": createDataConstraint({
//     //     id: "max-value",
//     //     name: "Max Value",
//     //     description: "The maximum value.",
//     //     optionsSchema: z.object({
//     //         value: z.number({ coerce: true })
//     //     }),
//     //     systemOnly: false,
//     //     forTypes: ["number"],
//     //     supersedes: [],

//     //     info: {
//     //         label: (options: { value: number }) => `Max: ${options.value}`,
//     //         description: (options: { value: number }) => `The value must be less than or equal to ${options.value}.`,
//     //         error: {
//     //             label: "Exceeds Max Value"
//     //         }
//     //     }
//     // }),
//     range: createDataConstraint({
//         name: "Range",
//         description: "The range of the value.",

//         params: {
//             min: {
//                 name: "Min",
//                 description: "The minimum value.",
//                 validate: value => z.number({ coerce: true }).safeParse(value)
//             },
//             max: {
//                 name: "Max",
//                 description: "The maximum value.",
//                 schema: z.number({ coerce: true })
//             },

//             step: {
//                 name: "Step",
//                 description: "The step of the value.",
//                 schema: {
//                     value: {
//                         name: "Value",
//                         description: "The value of the step.",
//                         schema: z.number({ coerce: true }).optional()
//                     },
//                     offset: {
//                         name: "Offset",
//                         description: "The offset of the step. Defaults to the minimum range value.",
//                         schema: z.number({ coerce: true }).optional()
//                     }
//                 }
//             }
//         },
//         systemOnly: false,
//         forTypes: ["number"],
//         supersedes: ["min-value", "max-value"],

//         info: {
//             label: (options: { min: number; max: number; step?: number }) =>
//                 `Range: ${options.min}-${options.max}${options.step ? `, Step: ${options.step}` : ""}`,
//             description: (options: { min: number; max: number; step?: number }) =>
//                 `The value must be between ${options.min} and ${options.max}${options.step ? `, with a step of ${options.step}` : ""}.`,

//             error: {
//                 label: "Exceeds Range"
//             }
//         },

//         validate: options => value =>
//             z
//                 .number({ coerce: true })
//                 .min(options.min - (options.interval?.origin ?? 0))
//                 .max(options.max - (options.interval?.origin ?? 0))
//                 .step(options.interval?.value ?? 1)
//                 .safeParse(value - (options.interval?.origin ?? 0))
//     })
// } as const

// type T = typeof dataConstraints.range.optionsSchema

// // export type DataConstraintConfigOptions<
// //     ID extends DataConstraintID,
// //     CamelCaseID extends CamelCaseDataConstraintID = KebabCaseToCamelCase<ID>,
// //     Constraint extends DataConstraint = (typeof dataConstraints)[CamelCaseID],
// //     OptionsSchema = Constraint["optionsSchema"]
// // > = OptionsSchema extends ZodSchema ? z.infer<OptionsSchema> : never

// // export type DataConstraintConfig<ID extends DataConstraintID = DataConstraintID> = {
// //     id: ID
// //     options: DataConstraintConfigOptions<ID>
// // }

// // // Configuration object.

// // export const dataConstraintConfig: DataConstraintConfig = {
// //     id: "max-length",
// //     options: {
// //         value: 255
// //     }
// // }

// // For range, it should infer different options
// const rangeConfig: DataConstraintConfig<"range"> = {
//     id: "range",
//     options: {
//         min: 0,
//         max: 100,
//         step: 1 // optional
//     }
// }

// /* EXAMPLE IMPLEMENTATION */

// //  1. Get the constraint IDs

// const constraintIds = dataConstraintIds

// //  2. Get the parameters for the selected constraint

// const selectedConstraintId: DataConstraintID = "range"
// const dataConstraintParameters = {
//     min: {
//         name: "Min",
//         description: "The minimum value.",
//         schema: z.number({ coerce: true })
//     },
//     max: {
//         name: "Max",
//         description: "The maximum value.",
//         schema: z.number({ coerce: true })
//     },

//     step: {
//         name: "Step",
//         description: "The step of the value.",
//         schema: {
//             value: {
//                 name: "Value",
//                 description: "The value of the step.",
//                 schema: z.number({ coerce: true }).optional()
//             },
//             offset: {
//                 name: "Offset",
//                 description: "The offset of the step. Defaults to the minimum range value.",
//                 schema: z.number({ coerce: true }).optional()
//             }
//         }
//     }
// }

// //  3. Assuming we get back the mapped and validated parameters, we can configure the constraint

// const { info, validate } = configureDataConstraint({ params })

// //  4. We can then use the constraint to validate the data

// const data = 50
// const isValid = constraint.optionsSchema.safeParse(data)

// const dataConstraint = {
//     validation: ["is-number", "limit-of-255"]
// }

/*

Ask Composer:

Would you suggest any changes to this Data Constraint model? I'm building a database tool like that of notion, where there are primitive data types, and then optional constraints/rules you can add to the dataset schema for each column. We're defining this in code and letting users pick from the ones we define.

My struggle is, one, organization. As the possible validation options grow, lets say we have 100, what is a good way to properly organize them and keep track of what already exists and maybe overlaps? I added a supercedes option for the user end of things, so if two rules are combined into one (like the range example) there will be a warning or error shown to use that instead. But, that doesn't solve the DX/internal issue here. I guess like anything else, split into different files/categories, and review previous ones before implementing something new...

Issue two is the general arbitrary data hierarchy & model. I've been fighting between whether or not to inclide required as a constraint. Reasons for: it needs/shares almost all the properties a constraint does, by definition it is a constraint, and it is displayed as a tag in the same way as constraints. However: it is almost on the primitive type-level in the way the application operates. For example, no validation checks are done if the type is not required. Also, I'm probably going to implement "required" as ui separate to the constraints collection/input, as it is very common and primitive in nature. Either way, required will be included in the schema (either as a constraint or a required boolean) but this is more of a ux/dx/model concern than anything.

As an extension of that concern - since we are really parsing everything initially as strings (accepting form inputs from Raycast, and otherwise) - the data types themselves are technically constraints as well? And should the range be implemented on the number type as a primitive (because it enables looping and seleciton functionality in the UI)? My take on that one is no, because all of our contraints are code-defined so we can create dynamic behaviour based on that - but I did consider it in the start. Even the range type/constraint is a mind fuck, because technically a range *type* is an input of 1-10, etc where a number type with a range constraint is just limited, etc.

I also don't know where in this model collections, (maybe objects? Although any kind of structured collections would likely just be references to another "row" of our database...) and options/enums would fit in here. I think an enum-style type would just be a primitive with an options constraint, and I could implement the relative functionality based on that.

What are your thoughts on these conclusions based on knowledge of other people's implementations, and could you help me find some clarity on that what and where, etc? Please try to hit all of my points.

*/
