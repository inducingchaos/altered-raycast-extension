/**
 *
 */

import { DataConstraintID } from "../definitions/ids"
import { rangeConstraint } from "./range"
import { requiredConstraint } from "./required"

type VerifyDataConstraintKeys = { [Key in DataConstraintID]: { id: Key } }

export const dataConstraints = {
    required: requiredConstraint,
    range: rangeConstraint

    // "max-length": { id: "max-length" },
    // "min-length": { id: "min-length" },
    // "max-value": { id: "max-value" },
    // "min-value": { id: "min-value" }
} as const satisfies VerifyDataConstraintKeys

export type DataConstraints = typeof dataConstraints
