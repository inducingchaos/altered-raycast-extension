/**
 *
 */

import { createDataConstraint } from ".."
import { dataTypeIds } from "~/domains/shared/data/definitions"

export const requiredConstraint = createDataConstraint({
    id: "required",
    name: "Required",
    description: "Whether or not the value is required.",
    label: "Required",
    instructions: "This value is required.",

    system: true,
    types: [...dataTypeIds],
    supersedes: [],

    options: null,

    validate: value => !!value
})
