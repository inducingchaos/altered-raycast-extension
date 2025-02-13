/**
 *
 */

import { type Type } from "arktype"
import { type } from "arktype"
import { serializableThoughtsSchema } from "../data"
import { DataConstraintID, dataConstraintIds, dataConstraints } from "../data/definitions/constraints"
import { DataConstraintOptions, InferSchemaFromOptions } from "../data/definitions/constraints/definitions/options"
import { SerializableDataConstraint } from "../data/definitions/constraints/definitions/serializable"
import { DataColumnBase } from "../data/definitions/columns/self"

// Goal: we want to create a function to dynamically parse the parameters of a constraint based on the options schema. This means going into the groups of the schema and parsing the parameters of each value in the group. For each value, including sibling values, we should recurse on that value so that each individual type can have its own type held in the function generic. We should return the accumulated object with no set type, just inferring the type from the result. If any of the parameter keys don't match the options schema keys or fail to parse, we should throw an error. That error should bubble up to the caller so that we can handle it appropriately.

//  Define a test ID.
const testConstraintId = "range" as string
if (!dataConstraintIds.includes(testConstraintId)) throw new Error(`Constraint with id ${testConstraintId} not found.`)

//  Get the options schema.
const optionsSchema = dataConstraints[testConstraintId as DataConstraintID]?.options

//  Get the serializable constraint.
const serializableConstraint = Array.from(serializableThoughtsSchema.columns as unknown as DataColumnBase[])
    .find(column => column.constraints?.some((constraint: SerializableDataConstraint) => constraint.id === testConstraintId))
    ?.constraints?.find((constraint: SerializableDataConstraint) => constraint.id === testConstraintId)
if (!serializableConstraint) throw new Error(`Constraint with id ${testConstraintId} not found.`)

//
//

export function parseDataConstraintParameters<
    Options extends DataConstraintOptions<Type>,
    Result extends InferSchemaFromOptions<Options>
>(schema: Options, params: unknown): Result {
    if (!schema || typeof params !== "object" || params === null) {
        throw new Error("Invalid schema or parameters")
    }

    // Validate that all param keys exist in schema
    const paramKeys = Object.keys(params as object)
    const schemaKeys = Object.keys(schema)
    const invalidKeys = paramKeys.filter(key => !schemaKeys.includes(key))
    if (invalidKeys.length > 0) {
        throw new Error(`Invalid parameter keys found: ${invalidKeys.join(", ")}`)
    }

    const result = {} as Result

    // Process all schema keys to ensure we handle required fields
    for (const [key, option] of Object.entries(schema)) {
        const paramValue = params[key as keyof typeof params]

        if (option.required && paramValue === undefined) {
            throw new Error(`Missing required parameter: ${key}`)
        }

        if (option.type === "group") {
            if (paramValue !== undefined) {
                if (typeof paramValue !== "object" || paramValue === null) {
                    throw new Error(`Invalid group parameter value for ${key}`)
                }
                result[key as keyof Result] = parseDataConstraintParameters(option.options, paramValue) as Result[keyof Result]
            }
        } else if (option.type === "value") {
            if (paramValue !== undefined) {
                const parsed = option.schema(paramValue)
                if (parsed instanceof type.errors) {
                    throw new Error(`Invalid value for ${key}: ${parsed.message}`)
                }
                result[key as keyof Result] = parsed as Result[keyof Result]
            }
        }
    }

    return result
}

export function test() {
    // Test the implementation
    if (optionsSchema) {
        try {
            const parsedParams = parseDataConstraintParameters(optionsSchema, serializableConstraint!.parameters)
            console.log("Successfully parsed parameters:", parsedParams)
        } catch (error) {
            console.error("Failed to parse parameters:", error)
        }
    }
}
