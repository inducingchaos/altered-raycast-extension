/**
 *
 */

import { SafeDataColumn } from "../columns"
import { SerializableDataSchema } from "./serializable"

export type SafeDataSchema = Omit<Omit<SerializableDataSchema, "id">, "columns"> & {
    id: string
    columns: SafeDataColumn[]
}
