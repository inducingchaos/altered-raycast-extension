/**
 *
 */

import { dataTypes, DataTypeID } from "../types"
import { DataColumnBase, DataColumnPresence } from "./self"

export type SerializableDataColumn = DataColumnBase &
    DataColumnPresence & {
        id?: string
        type: DataTypeID
    }

export const dataColumn: SerializableDataColumn = {
    id: "1",
    name: "Name",
    description: "The name of the column",
    type: dataTypes.string.id,
    rules: [],
    default: null,
    required: false
}
