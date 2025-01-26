/**
 *
 */

export const dataTypeIDs = ["string", "number", "boolean", "date"] as const

export type DataTypeID = (typeof dataTypeIDs)[number]

export type DataType = {
    id: DataTypeID
    name: string
    description?: string
    error: {
        label: string
        description: string
    }
}

export const dataTypes: Record<DataTypeID, DataType> = {
    string: {
        id: "string",
        name: "Text",
        error: {
            label: "Invalid Type",
            description: "The value must be a string."
        }
    },
    number: {
        id: "number",
        name: "Number",
        error: {
            label: "Invalid Type",
            description: "The value must be a number."
        }
    },
    boolean: {
        id: "boolean",
        name: "True/False",
        error: {
            label: "Invalid Type",
            description: "The value must be a boolean."
        }
    },
    date: {
        id: "date",
        name: "Date",
        error: {
            label: "Invalid Type",
            description: "The value must be a date."
        }
    }
} as const
