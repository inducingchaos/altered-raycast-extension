/**
 *
 */

import { ArkErrors } from "arktype"
import { DataConstraintParamsConfig, InferDataConstraintParams } from "../data/definitions/constraints"

export function parseDataConstraintParameters<
    Params extends DataConstraintParamsConfig | null,
    Result extends InferDataConstraintParams<Params>
>(schema: Params, params: unknown): Result {
    if (!schema || typeof params !== "object" || params === null) {
        console.error(schema, params)
        throw new Error("Invalid schema or parameters")
    }

    console.log("LOOKOUT 7", schema, params)

    // Validate that all param keys exist in schema
    const paramKeys = Object.keys(params as object)
    const schemaKeys = Object.keys(schema)
    const invalidKeys = paramKeys.filter(key => !schemaKeys.includes(key))
    if (invalidKeys.length > 0) {
        throw new Error(`Invalid parameter keys found: ${invalidKeys.join(", ")}`)
    }

    const result = {} as Result

    // Process all schema keys to ensure we handle required fields
    for (const [key, param] of Object.entries(schema)) {
        const paramValue = params[key as keyof typeof params]

        if (param.required && paramValue === undefined) {
            throw new Error(`Missing required parameter: ${key}`)
        }

        if (param.type === "group") {
            if (paramValue !== undefined) {
                if (typeof paramValue !== "object" || paramValue === null) {
                    throw new Error(`Invalid group parameter value for ${key}`)
                }
                result[key as keyof Result] = parseDataConstraintParameters(param.options, paramValue) as Result[keyof Result]
            }
        } else if (param.type === "value") {
            if (paramValue !== undefined) {
                const parsed = param.schema.definition(paramValue)
                if (parsed instanceof ArkErrors) {
                    throw new Error(`Invalid value for ${key}: ${parsed.message}`)
                }
                result[key as keyof Result] = parsed as Result[keyof Result]
            }
        }
    }

    console.log("DONE", result)

    return result
}
