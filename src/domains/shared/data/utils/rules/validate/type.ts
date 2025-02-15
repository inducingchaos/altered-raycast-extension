/**
 *
 */

import { dataTypes, DataTypeID, dataTypeIds } from "~/domains/shared/data"

export const validateType = ({ id, value }: { id: DataTypeID; value: string | undefined }): boolean => {
    if (!Object.values(dataTypeIds).includes(id)) throw new Error(`Type ${id} not found`)

    if (id === dataTypes.string.id) return true
    if (id === dataTypes.number.id) return !isNaN(Number(value))
    if (id === dataTypes.boolean.id) return value?.toLowerCase() === "true" || value?.toLowerCase() === "false"

    return false
}
