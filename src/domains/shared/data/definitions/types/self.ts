/**
 *
 */

import { type Type } from "arktype"
import { DataTypeID, DataTypeIDConfig, DataTypeIDKey } from "./ids"
import { DataTypeInfo } from "./info"
import { booleanType, numberType, stringType } from "./variants"

export type DataType<ID extends DataTypeID = DataTypeID, Schema extends Type = Type> = {
    id: ID
    info: DataTypeInfo
    schema: Schema
}

export function createDataType<ID extends DataTypeID, Schema extends Type>(
    options: DataType<ID, Schema>
): DataType<ID, Schema> {
    return options
}

type VerifyDataTypeKeys = { [Key in DataTypeIDKey]: { id: DataTypeIDConfig[Key] } }

export const dataTypes = {
    string: stringType,
    number: numberType,
    boolean: booleanType
} as const satisfies VerifyDataTypeKeys
