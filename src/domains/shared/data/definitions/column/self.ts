/**
 *
 */

import { DataRule } from "../rule"
import { DataType } from "../type"

export type DataColumn = {
    id: string
    name: string
    description: string

    type: DataType
    rules: DataRule[]
} & (
    | {
          default: string | null
          required: true
      }
    | {
          default: null
          required: false
      }
)
