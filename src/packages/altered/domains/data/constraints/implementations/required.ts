/**
 *
 */

import { createDataConstraint } from ".."
import { dataTypeIDs } from "~/domains/shared/data/definitions"

export const requiredConstraint = createDataConstraint({
    id: "required",
    name: "Required",
    description: "Whether or not the value is required.",
    label: "Required",
    instructions: "This value is required.",

    system: true,
    types: [...dataTypeIDs],
    supersedes: [],

    options: null,

    validate: value => !!value
})
