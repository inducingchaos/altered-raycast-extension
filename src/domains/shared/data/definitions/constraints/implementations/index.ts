/**
 *
 */

import { DataConstraintID } from "../definitions/ids"
import { maxLengthConstraint } from "./max-length"
import { optionsConstraint } from "./options"
import { rangeConstraint } from "./range"
import { requiredConstraint } from "./required"
import { minLengthConstraint } from "./min-length"
type VerifyDataConstraintKeys = { [Key in DataConstraintID]: { id: Key } }

export const dataConstraints = {
    required: requiredConstraint,
    range: rangeConstraint,
    options: optionsConstraint,
    "max-length": maxLengthConstraint,
    "min-length": minLengthConstraint
    // "max-value": { id: "max-value" },
    // "min-value": { id: "min-value" }
} as const satisfies VerifyDataConstraintKeys

export type DataConstraints = typeof dataConstraints
