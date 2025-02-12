/**
 *
 */

import { DataTypeID } from "../types"
import { DataColumnBase, DataColumnPresence } from "./self"

export type SerializableDataColumn = DataColumnBase &
    DataColumnPresence & {
        id?: string
        type: DataTypeID
    }
