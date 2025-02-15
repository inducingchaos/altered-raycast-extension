/**
 *
 */

import { SerializableDataColumn } from "../columns"
import { DataSchemaBase } from "./self"

// export type DataColumn = {
//     id: string
//     label: string
//     type: DataType
//     rules: DataRule[]
// }

export type SerializableDataSchema = DataSchemaBase & {
    id?: string
    columns: SerializableDataColumn[]
}
