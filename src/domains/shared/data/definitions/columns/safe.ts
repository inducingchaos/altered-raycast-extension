/**
 *
 */

import { SerializableDataColumn } from "./serializable"

export type SafeDataColumn = SerializableDataColumn & {
    id: string
}
