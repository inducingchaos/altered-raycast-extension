/**
 *
 */

import { createTypeSchema, traverse } from "@sdkit/utils"
import { type } from "arktype"
import { THIN_BAR, THIN_PIPE } from "~/domains/shared/utils"
import { createDataConstraint } from "../definitions"

export const rangeConstraint = createDataConstraint({
    id: "range",
    name: "Range",
    description: "The range of the value.",

    info: ({ constraint, params: { min, max, step } }) =>
        [
            !!min && {
                title: `Min: ${min}`,
                description: constraint.params!.min.description
            },
            !!max && {
                title: `Max: ${max}`,
                description: constraint.params!.max.description
            },
            !!step && {
                title: `Step  ${THIN_BAR}  Size: ${step?.size}${step?.offset ? ` ${THIN_PIPE} Offset: ${step?.offset}` : ""}`,
                description: `${constraint.params!.step.name}: ${constraint.params!.step.description.toLowerCase()} Contains ${constraint.params!.step.options.size.name}: ${constraint.params!.step.options.size.description.toLowerCase()}, and ${constraint.params!.step.options.offset.name}: ${constraint.params!.step.options.offset.description.toLowerCase()}`
            }
        ].filter(Boolean) as { title: string; description: string }[],

    label: ({ params: { min, max, step } }) => {
        return `${min ? `Min: ${min}, ` : ""}${max ? `Max: ${max}, ` : ""}${step?.size ? `Step: ${step.size}` : ""}`
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
            description: "The minimum allowed value.",

            required: false,
            schema: createTypeSchema("number")
        },
        max: {
            type: "value",
            name: "Maximum Value",
            description: "The maximum allowed value.",

            required: false,
            schema: createTypeSchema("number")
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

    validate: ({ params, value }) => {
        if (!params.min && !params.max && !params.step) return true

        const schema =
            !params.min && !params.max
                ? type(`number`)
                : !params.min
                  ? type(`number < ${params.max!}`)
                  : !params.max
                    ? type(`number > ${params.min}`)
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
