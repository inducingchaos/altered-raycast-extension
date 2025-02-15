/**
 *
 */

import { type } from "arktype"
import { createDataType, dataTypeIdConfig } from ".."
import { traverse } from "@sdkit/utils"

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
    schema: type("number"),
    select: ({ value, direction }) => {
        const number = value ? Number(value.trim()) : undefined
        const isNumber = number && !isNaN(number)
        const safeNumber = isNumber ? number : undefined

        return traverse({
            value: safeNumber,
            bounds: {
                min: 0
            },
            direction
        }).toString()
    }
})
