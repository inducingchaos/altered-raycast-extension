// /**
//  *
//  */

import { DataType } from "./types"

// export type LengthDataRuleID = "required" | "max-length" | "min-length"

// export type DataRuleID = "type" | LengthDataRuleID

export type DataRuleError = {
    label: string
    description: string
}

export type DataRule = {
    id: string
    name: string
    description: string
    error: DataRuleError

    types: DataType["id"][]
}

// const dataColumnRules: DataRule[] = [
//     {
//         id: "exceeds-max-length",
//         label: "Exceeds Max Length",
//         description: "The content must be 255 characters or less."
//     },
//     {
//         id: "cannot-be-empty",
//         label: "Required",
//         description: "The content cannot be empty."
//     },
//     {
//         id: "incorrect-type",
//         label: "Incorrect Type",
//         description: "NO DESCRIPTION"
//     }
// ] as const
