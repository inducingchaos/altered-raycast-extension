/**
 *
 */

import { type } from "arktype"
import { createDataType, dataTypeIdConfig } from ".."

export const stringType = createDataType({
    id: dataTypeIdConfig.string,
    info: {
        name: "String",
        label: "Text",
        description: "A string of text.",
        error: {
            title: "Incorrect Type",
            message: "The value must be text."
        }
    },
    schema: type("string > 1")
})
