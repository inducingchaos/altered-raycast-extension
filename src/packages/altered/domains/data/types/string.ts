/**
 *
 */

import { type } from "arktype"
import { DataType } from "."

export const stringType: DataType = {
    id: "string",
    info: {
        name: "Text",
        label: "Text",
        description: "A string of text.",
        error: {
            title: "Incorrect Type",
            message: "The value must be text."
        }
    },
    schema: type("string > 1")
}
