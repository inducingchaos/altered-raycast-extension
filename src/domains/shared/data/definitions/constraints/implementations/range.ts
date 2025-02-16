/**
 *
 */

import { createTypeSchema, traverse } from "@sdkit/utils"
import { type } from "arktype"
import { createDataConstraint } from "../definitions"

export const rangeConstraint = createDataConstraint({
    id: "range",
    name: "Range",
    description: "The range of the value.",

    label: ({ params: { min, max, step } }) => {
        return `${min ? `Min: ${min}, ` : ""}${max ? `Max: ${max}, ` : ""}${step?.size ? `Step: ${step.size}, ` : ""}`
    },
    instructions: ({ params: { min, max, step } }) =>
        `The value must be ${min ? `a minimum of ${min} ` : ""}${max ? `and a maximum of ${max}` : ""}${step?.size ? `, on a step of ${step.size}` : ""}${step?.offset ? `, offset by ${step.offset}` : ""}.`,
    error: { label: "Exceeds Range" },

    types: ["number"],
    supersedes: [],

    params: {
        min: {
            type: "value",
            name: "Minimum Value",
            description: "The minimum value allowed.",

            required: false,
            schema: createTypeSchema("number"),
            default: null
        },
        max: {
            type: "value",
            name: "Maximum Value",
            description: "The maximum value allowed.",

            required: false,
            schema: createTypeSchema("number"),
            default: null
        },
        step: {
            type: "group",
            name: "Stepping",
            description: "Configure stepping behavior for the range.",

            required: false,
            options: {
                size: {
                    type: "value",
                    name: "Step Size",
                    description: "The increment between allowed values.",

                    required: true,
                    schema: createTypeSchema("number")
                },
                offset: {
                    type: "value",
                    name: "Step Offset",
                    description: "The starting point for step calculations.",

                    required: false,
                    schema: createTypeSchema("number"),
                    default: 0
                }
            }
        }
    },

    select: ({ value, params, direction }) => {
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

    validate:
        ({ params }) =>
        ({ value }) => {
            if (params.min === null && params.max === null && params.step === null) return true

            const schema =
                params.min === null && params.max === null
                    ? type(`number`)
                    : params.min === null
                      ? type(`number < ${params.max!}`)
                      : params.max === null
                        ? type(`number > ${params.min!}`)
                        : type(`${params.min} < number < ${params.max}`)

            const result = schema(value)

            if (result instanceof type.errors) {
                console.error(result)
                return false
            }

            if (params.step) {
                const offsetValue = result + (params.step.offset ?? 0)

                const interval = offsetValue % params.step.size

                return interval === 0
            }

            return true
        }
})
