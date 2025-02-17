/**
 *
 */

// spell-checker: disable

export const dataTypeKeys = ["string", "number", "boolean"] as const
export type DataTypeKey = (typeof dataTypeKeys)[number]

export const dataTypeIdMap = {
    string: "9okMH4XWED_QbXGMiNNX5",
    number: "uQdkaIp8SLkkBAXZ_RKe-",
    boolean: "ESaRMNKcX1_znoAGbA2CN"
} as const satisfies { [key in DataTypeKey]: string }

export type DataTypeIDMap = typeof dataTypeIdMap

export const dataTypeIds = Object.values(dataTypeIdMap)
export type DataTypeID = (typeof dataTypeIds)[number]
