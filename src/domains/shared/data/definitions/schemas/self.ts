/**
 *
 */

import { DataColumn } from "../columns"

export type DataSchemaBase = {
    name: string
    description: string
}

export type DataSchema = DataSchemaBase & {
    id: string
    columns: DataColumn[]
}
