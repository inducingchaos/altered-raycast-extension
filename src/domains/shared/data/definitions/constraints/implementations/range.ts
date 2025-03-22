/**
 *
 */

import { createTypeSchema, traverse } from "@sdkit/utils"
import { type } from "arktype"
import { isValidNumber, parseNumberValue, THIN_PIPE } from "~/domains/shared/utils"
import { createDataConstraint } from "../definitions"

export const rangeConstraint = createDataConstraint({
    id: "range",
    name: "Range",
    description: "The range of the value.",

    info: ({ constraint, params: { min, max, step } }) =>
        [
            constraint.params &&
                isValidNumber(min) && {
                    title: `Min: ${min}`,
                    description: constraint.params.min.description
                },
            constraint.params &&
                isValidNumber(max) && {
                    title: `Max: ${max}`,
                    description: constraint.params.max.description
                },
            constraint.params &&
                isValidNumber(step?.size) && {
                    title: `Step: ${step.size}${isValidNumber(step?.offset) ? ` ${THIN_PIPE} Offset: ${step.offset}` : ""}`,
                    description: `${constraint.params.step.name}: ${constraint.params.step.description.toLowerCase()} Contains ${constraint.params.step.options.size.name}: ${constraint.params.step.options.size.description.toLowerCase()}, and ${constraint.params.step.options.offset.name}: ${constraint.params.step.options.offset.description.toLowerCase()}`
                }
        ].filter(Boolean) as { title: string; description: string }[],

    label: ({ params: { min, max, step } }) => {
        return `${isValidNumber(min) ? `Min: ${min}, ` : ""}${isValidNumber(max) ? `Max: ${max}, ` : ""}${isValidNumber(step?.size) ? `Step: ${step!.size}` : ""}`
    },
    instructions: ({ params: { min, max, step } }) =>
        `The value must be ${isValidNumber(min) ? `a minimum of ${min} ` : ""}${isValidNumber(max) ? `and a maximum of ${max}` : ""}${isValidNumber(step?.size) ? `, on a step of ${step!.size}` : ""}${isValidNumber(step?.offset) ? `, offset by ${step!.offset}` : ""}.`,
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
        const safeNumber = parseNumberValue(value)

        // console.log(
        //     "isValidNumber(params.min)",
        //     isValidNumber(params.min),
        //     "isValidNumber(params.max)",
        //     isValidNumber(params.max)
        // )

        const result = traverse({
            value: safeNumber,
            bounds: {
                min: isValidNumber(params.min) ? params.min : undefined,
                max: isValidNumber(params.max) ? params.max : undefined,
                wrap: isValidNumber(params.min) && isValidNumber(params.max)
            },
            step: {
                size: isValidNumber(params.step?.size) ? params.step!.size : 1,
                offset: isValidNumber(params.step?.offset) ? params.step!.offset! : 0
            },
            direction
        })

        // console.log("result", result)

        return result.toString()
    },

    validate: ({ params, value }) => {
        const numberValue = parseNumberValue(value)
        if (!numberValue) return false

        if (!isValidNumber(params.min) && !isValidNumber(params.max) && !isValidNumber(params.step?.size)) return true

        const schema =
            !isValidNumber(params.min) && !isValidNumber(params.max)
                ? type(`number`)
                : !isValidNumber(params.min) && isValidNumber(params.max)
                  ? type(`number <= ${params.max}`)
                  : !isValidNumber(params.max) && isValidNumber(params.min)
                    ? type(`number >= ${params.min}`)
                    : isValidNumber(params.min) && isValidNumber(params.max)
                      ? type(`${params.min} <= number <= ${params.max}`)
                      : type(`number`)

        const result = schema(numberValue)

        if (result instanceof type.errors) {
            console.error(result.message)
            return false
        }

        if (isValidNumber(params.step?.size)) {
            const offsetValue = result + (isValidNumber(params.step.offset) ? params.step.offset : 0)

            const interval = offsetValue % params.step.size

            return interval === 0
        }

        return true
    }
})
