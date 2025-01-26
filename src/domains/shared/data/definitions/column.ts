/**
 *
 */

import { DataRule } from "./rule"
import { DataType } from "./type"

export type DataColumn = {
    id: string
    label: string
    description: string

    type: DataType
    rules: DataRule[]
}

export type SerializableDataColumn = Omit<DataColumn, "type"> & {
    type: DataType["id"]
}
