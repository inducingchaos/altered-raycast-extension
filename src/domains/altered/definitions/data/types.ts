/**
 *
 */

export const dataTypeIds = ["string", "number", "boolean"] as const

export type DataTypeID = (typeof dataTypeIds)[number]

export type DataType = {
    id: DataTypeID
    name: string
    description?: string
    error: {
        description: string
    }
}

export const dataTypes: Record<DataTypeID, DataType> = {
    string: {
        id: "string",
        name: "Text",
        error: {
            description: "The value must be a string."
        }
    },
    number: {
        id: "number",
        name: "Number",
        error: {
            description: "The value must be a number."
        }
    },
    boolean: {
        id: "boolean",
        name: "True/False",
        error: {
            description: "The value must be a boolean."
        }
    }
} as const
