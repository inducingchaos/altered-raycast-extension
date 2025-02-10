/**
 *
 */

import { type } from "arktype"
import { DataType } from "."

export const booleanType: DataType = {
    id: "boolean",
    info: {
        name: "Boolean",
        label: "True/False",
        description: "A true/false value.",
        error: {
            title: "Incorrect Type",
            message: "The value must be true or false."
        }
    },
    schema: type("boolean")
}
