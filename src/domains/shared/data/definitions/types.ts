/**
 *
 */

export type DataTypeID = "string" | "number" | "boolean" | "date"

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
        name: "Boolean",
        description: "A value that represents true or false."
    },
    date: {
        id: "date",
        name: "Date"
    }
} as const
