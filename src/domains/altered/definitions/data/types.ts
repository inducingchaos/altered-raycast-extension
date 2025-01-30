/**
 *
 */

import { z, ZodSchema } from "zod"
import { LayeredInfo } from "./common"

export const dataTypeIds = ["string", "number", "boolean"] as const
export type DataTypeID = (typeof dataTypeIds)[number]

/**
 * Base configuration for a primitive data type
 */
export type DataType<Schema extends ZodSchema = ZodSchema> = {
    id: DataTypeID
    info: LayeredInfo
    baseSchema: Schema
}

// Example implementation for number type
export const numberType: DataType<z.ZodNumber> = {
    id: "number",
    info: {
        config: {
            name: "Number",
            description:
                "A sequence of digits used for calculations. For numbers that serve as labels, use the 'Text' type instead.",
            icon: "number"
        },
        usage: {
            label: "Number",
            description: "A number value.",
            error: {
                label: "Not a Number",
                description: "The value must be a number."
            }
        }
    },
    baseSchema: z.number({ coerce: true })
}

export const dataTypes: Record<DataTypeID, DataType> = {
    string: {
        id: "string",
        info: {
            config: {
                name: "Text",
                description: "A sequence of characters used for labels, descriptions, or other textual content.",
                icon: "text"
            },
            usage: {
                label: "Text",
                description: "A text value.",
                error: {
                    label: "Not Text",
                    description: "The value must be text."
                }
            }
        },
        baseSchema: z.string()
    },
    number: {
        id: "number",
        info: {
            config: {
                name: "Number",
                description:
                    "A sequence of digits used for calculations. For numbers that serve as labels, use the 'Text' type instead.",
                icon: "number"
            },
            usage: {
                label: "Number",
                description: "A number value.",
                error: {
                    label: "Not a Number",
                    description: "The value must be a number."
                }
            }
        },
        baseSchema: z.number({ coerce: true })
    },
    boolean: {
        id: "boolean",
        info: {
            config: {
                name: "Boolean",
                description: "A true/false value used for yes/no questions or toggles.",
                icon: "toggle"
            },
            usage: {
                label: "True/False",
                description: "A true/false value.",
                error: {
                    label: "Not a Boolean",
                    description: "The value must be true or false."
                }
            }
        },
        baseSchema: z.boolean()
    }
} as const
