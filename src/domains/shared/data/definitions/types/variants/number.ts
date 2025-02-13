/**
 *
 */

import { type } from "arktype"
import { createDataType, dataTypeIdConfig } from ".."

export const numberType = createDataType({
    id: dataTypeIdConfig.number,
    info: {
        name: "Number",
        description: "A numerical value used for calculations.",
        error: {
            title: "Incorrect Type",
            message: column => `'${column.name}' must be a number.`
        }
    },
    schema: type("number")
})
