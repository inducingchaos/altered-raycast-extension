/**
 *
 */

import { DataConstraintID } from "../definitions/ids"
import { optionsConstraint } from "./options"
import { rangeConstraint } from "./range"
import { lengthConstraint } from "./length"
import { requiredConstraint } from "./required"
type VerifyDataConstraintKeys = { [Key in DataConstraintID]: { id: Key } }

export const dataConstraints = {
    required: requiredConstraint,
    range: rangeConstraint,
    options: optionsConstraint,
    length: lengthConstraint
    // "max-value": { id: "max-value" },
    // "min-value": { id: "min-value" }
} as const satisfies VerifyDataConstraintKeys

export type DataConstraints = typeof dataConstraints
