/**
 *
 */

// spell-checker: disable

export const dataTypeIdKeys = ["string", "number", "boolean"] as const
export type DataTypeIDKey = (typeof dataTypeIdKeys)[number]

export const dataTypeIdConfig = {
    string: "9okMH4XWED_QbXGMiNNX5",
    number: "uQdkaIp8SLkkBAXZ_RKe-",
    boolean: "ESaRMNKcX1_znoAGbA2CN"
} as const satisfies Record<DataTypeIDKey, string>

export type DataTypeIDConfig = typeof dataTypeIdConfig

export const dataTypeIds = Object.values(dataTypeIdConfig)
export type DataTypeID = (typeof dataTypeIds)[number]
