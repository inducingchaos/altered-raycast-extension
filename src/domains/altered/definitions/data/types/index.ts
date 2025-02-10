/**
 *
 */

// spell-checker: disable

import { type Type } from "arktype"
import { numberType } from "./number"
import { booleanType } from "./boolean"
import { stringType } from "./string"

export const dataTypeUids = {
    string: "9okMH4XWED_QbXGMiNNX5",
    number: "uQdkaIp8SLkkBAXZ_RKe-",
    boolean: "ESaRMNKcX1_znoAGbA2CN"
} as const
export const dataTypeIds = Object.keys(dataTypeUids)
export type DataTypeID = keyof typeof dataTypeUids

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
