/**
 *
 */

import { isValidNumber } from "~/domains/shared/utils"

type Base = { value?: number }
type Bounds = { bounds: { min?: number; max?: number; wrap?: boolean } }
type BoundsWithMin = { bounds: { min: number; max?: number; wrap?: boolean } }
type BoundsWithMax = { bounds: { min?: number; max: number; wrap?: boolean } }
type BoundsWithMinMax = { bounds: { min: number; max: number; wrap?: boolean } }
type Step = { step?: { size: number; offset: number } }
type NullStep = { step: null }
type StepDirections = "previous" | "next" | "nearest"
type BoundsDirections = "start" | "end"

type WithoutStep =
    | (Bounds & { direction?: "none" })
    | (BoundsWithMin & { direction?: "start" | "none" })
    | (BoundsWithMax & { direction?: "end" | "none" })
    | (BoundsWithMinMax & { direction?: BoundsDirections | "none" })

type WithStep =
    | (Bounds & { direction: StepDirections })
    | (BoundsWithMin & { direction: "start" | StepDirections })
    | (BoundsWithMax & { direction: "end" | StepDirections })
    | (BoundsWithMinMax & { direction: BoundsDirections | StepDirections })

type Conditional = (Step & WithStep) | (NullStep & WithoutStep)

export type TraverseOptions = Base & Conditional

/**
 * Allows for the traversal of a value within a parameterized range.
 *
 * @todo
 * - [P3] Handle case where `step` is null or zero.
 * - [P3] Add support for adjustable precision.
 * - [P3] Test the effects of negatives on modulus operations.
 */
export function traverse(options: TraverseOptions): number
export function traverse(options: TraverseOptions & { debug?: boolean }): number
export function traverse(options: TraverseOptions & { debug?: boolean }): number {
    let debugStep = 1

    //  Configure globals.

    const _isClosedRange = isValidNumber(options.bounds.min) && isValidNumber(options.bounds.max)

    const {
        value = _isClosedRange ? options.bounds.min! : 0,
        bounds: { min, max, wrap = false },
        step: { size = 1, offset = 0 },
        direction = "none",

        debug = false
    } = {
        ...options,
        step: { ...options.step }
    }

    const isClosedRange = isValidNumber(min) && isValidNumber(max)
    const isStepped = isValidNumber(size) && size !== 0

    if (debug)
        console.log(debugStep++, "Configured globals:", {
            value,
            bounds: { min, max, wrap },
            step: { size, offset },
            direction,
            isClosedRange,
            isStepped
        })

    //  Guard conditions.

    if (wrap && (!isValidNumber(min) || !isValidNumber(max))) throw new Error("Cannot wrap an open range.")

    //  Resolve bounds. Corrects the range if reversed.

    const needsResolution = isClosedRange && min > max
    const resolvedMin = needsResolution ? Math.min(min, max) : min
    const resolvedMax = needsResolution ? Math.max(min, max) : max

    if (debug) console.log(debugStep++, "Resolved bounds:", { resolvedMin, resolvedMax })

    //  Handle the absence of stepping.

    if (!isStepped) {
        if (direction === "start" && resolvedMin) return resolvedMin
        if (direction === "end" && resolvedMax) return resolvedMax

        if (direction === "none") {
            if (wrap && isClosedRange) throw new Error("Not implemented.")

            let target = 0
            if (resolvedMin) target = Math.max(resolvedMin, target)
            if (resolvedMax) target = Math.min(resolvedMax, target)

            return target
        }

        throw new Error("Unknown error.")
    }

    //  Calculate boundary steps. These are the outermost steps within the range.

    const firstStep = resolvedMin ? Math.ceil((resolvedMin - offset) / size) * size + offset : undefined
    const lastStep = resolvedMax ? Math.floor((resolvedMax - offset) / size) * size + offset : undefined

    if (debug) console.log(debugStep++, "Boundary steps:", { firstStep, lastStep })

    //  Return early if the direction is 'start' or 'end'.

    if (direction === "start" && firstStep) return firstStep
    else if (direction === "start") throw new Error("Traversal to start is unavailable without a lower bound.")

    if (direction === "end" && lastStep) return lastStep
    else if (direction === "end") throw new Error("Traversal to end is unavailable without an upper bound.")

    if (debug) console.log(debugStep++, "Direction is not 'start' or 'end':", { direction })

    //  Shift the range values so that the first step is at zero.

    const shiftOffset = firstStep ?? offset
    const shiftedValue = value - shiftOffset
    const shiftedMax = lastStep ? lastStep - shiftOffset : undefined

    if (debug) console.log(debugStep++, "Shifted values:", { shiftedValue, shiftedMax })

    //  Normalize the range to be stepped in increments of 1.

    const normalizedValue = shiftedValue / size
    const normalizedMax = shiftedMax ? shiftedMax / size : undefined

    if (debug) console.log(debugStep++, "Normalized values:", { normalizedValue, normalizedMax })

    //  Calculate the destination step.

    let targetStep: number = 0
    if (direction === "next") targetStep = Math.floor(normalizedValue) + 1
    if (direction === "previous") targetStep = Math.ceil(normalizedValue) - 1
    if (direction === "nearest") targetStep = Math.round(normalizedValue)

    if (debug) console.log(debugStep++, "Target step:", { targetStep })

    //  Wrap the step if necessary.

    if (isClosedRange && wrap) {
        const stepMax = normalizedMax! + 1
        targetStep = ((targetStep % stepMax) + stepMax) % stepMax
    }

    if (debug) console.log(debugStep++, "Wrapped step:", { targetStep })

    //  Clamp step to range.

    if (firstStep) targetStep = Math.max(0, targetStep)
    if (normalizedMax) targetStep = Math.min(normalizedMax, targetStep)

    if (debug) console.log(debugStep++, "Clamped step:", { targetStep })

    //  Denormalize.

    const denormalizedValue = targetStep * size + (firstStep ?? offset)

    if (debug) console.warn(debugStep++, "Denormalized value:", { denormalizedValue })

    return denormalizedValue
}
