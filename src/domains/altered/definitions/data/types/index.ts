/**
 *
 */

import { type Type } from "arktype"
import { numberType } from "./number"
import { booleanType } from "./boolean"
import { stringType } from "./string"

export const dataTypeIds = ["string", "number", "boolean"] as const
export type DataTypeID = (typeof dataTypeIds)[number]

export type DataTypeInfo = {
    name: string
    label: string
    description: string

    error?: {
        title: string
        message: string
    }
}

export type DataType<Schema extends Type = Type> = {
    id: DataTypeID
    info: DataTypeInfo
    schema: Schema
}

export const dataTypes: Record<DataTypeID, DataType> = {
    string: stringType,
    number: numberType,
    boolean: booleanType
} as const
