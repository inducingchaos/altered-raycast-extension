/**
 *
 */

import { SerializableDataColumn } from "./column"

// export type DataColumn = {
//     id: string
//     label: string
//     type: DataType
//     rules: DataRule[]
// }

export type SerializableDataSchema = {
    id: string
    name: string
    description: string
    system: boolean

    columns: SerializableDataColumn[]
}
