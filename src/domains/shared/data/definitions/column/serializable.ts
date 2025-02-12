/**
 *
 */

import { DataType } from "../type"
import { DataColumn } from "./self"

export type SerializableDataColumn = Omit<Omit<DataColumn, "id">, "type"> & {
    id?: string
    type: DataType["id"]
}
