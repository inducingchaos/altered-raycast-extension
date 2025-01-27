/**
 *
 */

import { HFDataType } from "./data-type"

export type HFRow = {
    id: string | undefined
    name: string
    description: string

    type: HFDataType
    default: string | null
    required: boolean
    rules: HFConstraint[]
} & (
    | {
          default: string
          required: false
      }
    | {
          default: null
          required: true
      }
)
