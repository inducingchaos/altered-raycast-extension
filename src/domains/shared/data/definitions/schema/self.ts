/**
 *
 */

import { SerializableDataColumn } from "../column"

export type DataSchema = {
    id: string
    name: string
    description: string

    columns: SerializableDataColumn[]
}
