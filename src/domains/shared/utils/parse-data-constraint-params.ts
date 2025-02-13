/**
 *
 */

import { ArkErrors, Type } from "arktype"
import { DataConstraintOptions, InferSchemaFromOptions } from "../data/definitions/constraints"

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
                if (parsed instanceof ArkErrors) {
                    throw new Error(`Invalid value for ${key}: ${parsed.message}`)
                }
                result[key as keyof Result] = parsed as Result[keyof Result]
            }
        }
    }

    return result
}
