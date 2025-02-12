/**
 *
 */

import { SerializableDataColumn } from "../column"
import { DataSchema } from "./self"

// export type DataColumn = {
//     id: string
//     label: string
//     type: DataType
//     rules: DataRule[]
// }

export type SerializableDataSchema = Omit<DataSchema, "id"> & {
    id?: string
    columns: SerializableDataColumn[]
}
