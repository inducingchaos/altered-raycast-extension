/**
 *
 */

import { type } from "arktype"
import { createDataType, dataTypeIdConfig } from ".."

export const booleanType = createDataType({
    id: dataTypeIdConfig.boolean,
    info: {
        name: "Boolean",
        label: "True/False",
        description: "A true/false value.",
        error: {
            title: "Incorrect Type",
            message: column => `'${column.name}' must be true or false.`
        }
    },
    schema: type("boolean")
})
