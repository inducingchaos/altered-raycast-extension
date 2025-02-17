/**
 *
 */

import { type Type } from "arktype"
import { DataTypeID, DataTypeIDMap, DataTypeKey } from "./ids"
import { DataTypeInfo } from "./info"
import { booleanType, numberType, stringType } from "./variants"

export type DataType<ID extends DataTypeID = DataTypeID, Schema extends Type = Type> = {
    id: ID
    info: DataTypeInfo
    schema: Schema
    select?: (props: { value: string | undefined; direction: "previous" | "next" }) => string
}

export function createDataType<ID extends DataTypeID, Schema extends Type>(
    options: DataType<ID, Schema>
): DataType<ID, Schema> {
    return options
}

type VerifyDataTypeKeys = { [Key in DataTypeKey]: { id: DataTypeIDMap[Key] } }

export const dataTypes = {
    string: stringType,
    number: numberType,
    boolean: booleanType
} as const satisfies VerifyDataTypeKeys
