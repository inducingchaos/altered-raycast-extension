/**
 *
 */

import { SerializableDataConstraint } from "../constraints"
import { DataRule } from "../rule"
import { DataType } from "../types"

export type DataColumnBase = {
    name: string
    description: string

    rules?: DataRule[]

    constraints?: SerializableDataConstraint[]
}

export type DataColumnPresence =
    | {
          default?: string | null
          required: true
      }
    | {
          default?: null
          required: false
      }

export type DataColumn = DataColumnBase &
    DataColumnPresence & {
        id: string
        type: DataType
    }
