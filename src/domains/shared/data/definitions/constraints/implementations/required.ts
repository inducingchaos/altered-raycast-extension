/**
 *
 */

import { dataTypeIdKeys } from "~/domains/shared/data/definitions"
import { createDataConstraint } from ".."

export const requiredConstraint = createDataConstraint({
    id: "required",
    name: "Required",
    description: "Whether or not the value is required.",
    label: "Required",
    instructions: "This value is required.",

    system: true,
    types: [...dataTypeIdKeys],
    supersedes: [],

    params: null,

    validate:
        () =>
        ({ value }) =>
            !!value
})

// In the future, when we know how required will be used, consider passing (for constraints with multiple types) the type details to the constraint - actually - it can be any, and we won't know until the constraint is configured, so just pass all and test at runtime. We can just use the Type generic to pass in a prop to something like description, label, etc.
