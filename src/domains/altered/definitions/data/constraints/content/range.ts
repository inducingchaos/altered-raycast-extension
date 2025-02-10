/**
 *
 */

import { type } from "arktype"
import { createDataConstraint } from ".."

export const rangeConstraint = createDataConstraint({
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
                value: {
                    type: "value",
                    name: "Step Value",
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

    validate: (value, options) => {
        if (options.min === null && options.max === null) return true

        const schema =
            options.min === null
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

            const interval = offsetValue % options.step.value

            return interval === 0
        }

        return true
    }
})
