/**
 *
 */

import { SafeDataColumn } from ".."

export type DataTypeInfo = {
    name: string
    label?: string
    description: string

    error?: {
        title: string
        message: string | ((column: SafeDataColumn) => string)
    }
}
