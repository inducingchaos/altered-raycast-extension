/**
 *
 */

export const dataTypeIDs = ["string", "number", "boolean", "date"] as const

export type DataTypeID = (typeof dataTypeIDs)[number]

export type DataType = {
    id: DataTypeID
    name: string
    description?: string
}

export const dataTypes: Record<DataTypeID, DataType> = {
    string: {
        id: "string",
        name: "Text"
    },
    number: {
        id: "number",
        name: "Number"
    },
    boolean: {
        id: "boolean",
        name: "True/False"
        // description: "A value that represents true or false."
    },
    date: {
        id: "date",
        name: "Date"
    }
} as const
