/**
 *
 */

import { traverse } from "@sdkit/utils"
import { type } from "arktype"
import { createDataConstraint } from ".."

export const rangeConstraint = createDataConstraint({
    id: "range",
    name: "Range",
    description: "The range of the value.",
    label: options => {
        return `Range: ${options.min}-${options.max}${options.step?.size ? `, Step: ${options.step.size}` : ""}`
    },
    instructions: options =>
        `The value must be between ${options.min} and ${options.max}${
            options.step?.size ? `, with a step of ${options.step.size}` : ""
        }.`,
    error: {
        label: "Exceeds Range"
    },

    types: ["number"],
    supersedes: [],
    // supersedes: ["min-value", "max-value"],

    options: {
        min: {
            type: "value",
            name: "Minimum",
            description: "The minimum value allowed.",

            required: false,
            schema: type("number")
        },
        max: {
            type: "value",
            name: "Maximum",
            description: "The maximum value allowed.",

            required: false,
            schema: type("number")
        },
        step: {
            type: "group",
            name: "Step",
            description: "Configure stepping behavior for the range.",

            required: false,
            options: {
                size: {
                    type: "value",
                    name: "Step Size",
                    description: "The increment between allowed values.",

                    required: true,
                    schema: type("number")
                },
                offset: {
                    type: "value",
                    name: "Step Offset",
                    description: "The starting point for step calculations.",

                    required: false,
                    schema: type("number")
                }
            }
        }
    },

    cycle: (value, params, direction) => {
        const number = value ? Number(value.trim()) : undefined
        const isNumber = number && !isNaN(number)
        const safeNumber = isNumber ? number : undefined

        const result = traverse({
            value: safeNumber,
            bounds: {
                min: params.min ?? undefined,
                max: params.max ?? undefined,
                wrap: params.min !== null && params.max !== null
            },
            step: { size: params.step?.size ?? 1, offset: params.step?.offset ?? 0 },
            direction
        })

        return result.toString()
    },

    validate: (value, options) => {
        if (options.min === null && options.max === null && options.step === null) return true

        const schema =
            options.min === null && options.max === null
                ? type(`number`)
                : options.min === null
                  ? type(`number < ${options.max!}`)
                  : options.max === null
                    ? type(`number > ${options.min!}`)
                    : type(`${options.min} < number < ${options.max}`)

        const result = schema(value)

        if (result instanceof type.errors) {
            console.error(result)
            return false
        }

        if (options.step) {
            const offsetValue = result + (options.step.offset ?? 0)

            const interval = offsetValue % options.step.size

            return interval === 0
        }

        return true
    }
})
