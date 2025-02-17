/**
 *
 */

import { type } from "arktype"
import { createDataType, dataTypeIdMap } from ".."

export const stringType = createDataType({
    id: dataTypeIdMap.string,
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
