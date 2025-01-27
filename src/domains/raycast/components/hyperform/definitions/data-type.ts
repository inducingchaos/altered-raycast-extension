/**
 *
 */

export const hfDataTypeIds = ["string", "number", "boolean"] as const

export type HFDataTypeID = (typeof hfDataTypeIds)[number]

export type HFDataType = {
    id: HFDataTypeID
    name: string
    description?: string
    error: {
        description: string
    }
}

export const hfDataTypes: Record<HFDataTypeID, HFDataType> = {
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
