/**
 *
 */

import { DataType, dataTypeIDs } from "../../../definitions/type"

export const validateType = ({ id, value }: { id: DataType["id"]; value: string | undefined }): boolean => {
    if (!dataTypeIDs.includes(id)) throw new Error(`Type ${id} not found`)

    if (id === "string") return true
    if (id === "number") return !isNaN(Number(value))
    if (id === "boolean") return value === "true" || value === "false"

    return false
}
