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

    cycle: (value, params, direction) => {
        // determine if the value is in range

        const defaultedStep = {
            value: params.step?.value ?? 1,
            offset: params.step?.offset ?? 0
        }

        const number = value && Number(value.trim())
        const isNumber = number && !isNaN(number)

        console.warn("CHECKPOINT 0", number, isNumber ? "is a number" : "is not a number from", value)

        // parameters: {
        //     min: 1.9,
        //     max: 11.05,
        //     step: {
        //         value: 2,
        //         offset: 0.25
        //     }
        // }

        // [ 2.25, 4.25, 6.25, 8.25, 10.25 ]

        const schema =
            params.min === null && params.max === null
                ? type(`number`)
                : params.min === null && params.max !== null
                  ? type(`number < ${params.max}`)
                  : params.min !== null && params.max === null
                    ? type(`number > ${params.min}`)
                    : params.min !== null && params.max !== null
                      ? type(`${params.min} < number < ${params.max}`)
                      : type.never

        const result = schema(number)
        console.warn("CHECKPOINT 0.5", result)
        const isInRange = !(result instanceof type.errors)
        // TODO: if NOT in range, cycle from min value

        console.warn("CHECKPOINT 1", !isInRange ? result.message : "in range")

        //  determine if the value is on a step

        const getInterval = (value: number, step: { value: number; offset: number }) => {
            const offsetValue = value - step.offset

            return offsetValue % step.value
        }

        console.warn("CHECKPOINT 2", getInterval(result, defaultedStep))

        const isOnStep = isInRange && getInterval(result, defaultedStep) === 0

        console.warn("CHECKPOINT 2.5", isOnStep ? "is on step" : "is not on step")

        // if out of range or incorrect type, cycle from the min value to the first step, or backwards to the last step

        if (!isInRange) {
            const startingPoint = (direction === "next" ? params.min : params.max) ?? 0
            const deviance = getInterval(startingPoint, defaultedStep)

            if (deviance === 0) {
                console.warn(
                    "CHECKPOINT 3",
                    startingPoint + (direction === "next" ? defaultedStep.value : -defaultedStep.value)
                )
                return startingPoint.toString()
            }
            // ceil ( (1.9 -0.25) / 2) * 2 + 0.25
            // THIS MAY BE INCORRECT
            else {
                console.warn(
                    "CHECKPOINT 4",
                    startingPoint + (direction === "next" ? defaultedStep.value : -defaultedStep.value)
                )
                console.warn("CHECKPOINT 4.1", startingPoint, deviance)
                return (
                    direction === "next"
                        ? Math.ceil(startingPoint / defaultedStep.value) * defaultedStep.value + defaultedStep.offset
                        : Math.floor(startingPoint / defaultedStep.value) * defaultedStep.value + defaultedStep.offset
                ).toString()
            }
        }

        // if on step, go next or previous step

        if (isOnStep) {
            const desiredStep = result + (direction === "next" ? defaultedStep.value : -defaultedStep.value)
            console.warn("CHECKPOINT 5", desiredStep)
            return desiredStep.toString()
        }

        console.warn("CHECKPOINT 5", result + (direction === "next" ? defaultedStep.value : -defaultedStep.value))

        // if between step, cycle to the nearest step

        const deviance = getInterval(result, defaultedStep)
        const desiredStep = result + (direction === "next" ? -deviance : deviance)

        if (params.max && desiredStep > params.max) {
            console.warn("CHECKPOINT 6", params.max.toString())
            return params.max.toString()
        }

        if (params.min && desiredStep < params.min) {
            console.warn("CHECKPOINT 7", params.min.toString())
            return params.min.toString()
        }

        console.warn("CHECKPOINT 8", desiredStep.toString())
        return desiredStep.toString()
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

            const interval = offsetValue % options.step.value

            return interval === 0
        }

        return true
    }
})
