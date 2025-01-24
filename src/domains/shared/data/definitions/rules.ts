/**
 *
 */

export type LengthDataRuleID = "required" | "max-length" | "min-length"

export type DataRuleID = "type" | LengthDataRuleID

export type DataRule = {
    id: DataRuleID
    label: string
    description: string
    error: {
        label: string
        description: string
    }
}

const dataColumnRules: DataRule[] = [
    {
        id: "exceeds-max-length",
        label: "Exceeds Max Length",
        description: "The content must be 255 characters or less."
    },
    {
        id: "cannot-be-empty",
        label: "Required",
        description: "The content cannot be empty."
    },
    {
        id: "incorrect-type",
        label: "Incorrect Type",
        description: "NO DESCRIPTION"
    }
] as const
