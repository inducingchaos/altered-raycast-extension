import { z } from "zod"
import { ValidationRule } from "./validation"

export type Required = ValidationRule<z.ZodNull> & {
    type: "required"
}

export const required: Required = {
    type: "required",
    name: "Required",
    description: "Whether or not the value is required.",
    options: z.null(),
    info: {
        label: "Required",
        description: "The content cannot be empty.",
        error: {
            label: "Required",
            description: "This field cannot be empty."
        }
    },
    validate: () => value =>
        z
            .null()
            .transform(() => {
                if (!value || value.trim() === "") {
                    return z.NEVER
                }
                return null
            })
            .safeParse(null)
}
