/**
 *
 */

import { DataRule } from "./rule"
import { DataType } from "./type"

export type DataColumn = {
    id: string
    name: string
    description: string
    default: string | null

    type: DataType
    required: boolean
    rules: DataRule[]
}

export type SerializableDataColumn = Omit<DataColumn, "type"> & {
    type: DataType["id"]
}
