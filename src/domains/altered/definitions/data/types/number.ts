/**
 *
 */

import { type } from "arktype"
import { DataType } from "."

export const numberType: DataType = {
    id: "number",
    info: {
        name: "Number",
        label: "Number",
        description: "A numerical value used for calculations.",
        error: {
            title: "Incorrect Type",
            message: "The value must be a number."
        }
    },
    schema: type("number")
}
