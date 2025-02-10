/**
 *
 */

import { rangeConstraint } from "./range"
import { requiredConstraint } from "./required"

export const dataConstraints = {
    required: requiredConstraint,
    range: rangeConstraint
} as const
