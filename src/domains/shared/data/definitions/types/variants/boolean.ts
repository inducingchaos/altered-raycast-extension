/**
 *
 */

import { type } from "arktype"
import { createDataType, dataTypeIdMap } from ".."

export const booleanType = createDataType({
    id: dataTypeIdMap.boolean,
    info: {
        name: "Boolean",
        label: "True/False",
        description: "A true/false value.",
        error: {
            title: "Incorrect Type",
            message: column => `'${column.name}' must be true or false.`
        }
    },
    schema: type("boolean"),
    select: ({ value }) => (value === "true" ? "false" : "true")
})
