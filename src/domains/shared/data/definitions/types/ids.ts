/**
 *
 */

// spell-checker: disable

export const dataTypeIdConfig = {
    string: "9okMH4XWED_QbXGMiNNX5",
    number: "uQdkaIp8SLkkBAXZ_RKe-",
    boolean: "ESaRMNKcX1_znoAGbA2CN"
} as const
export type DataTypeIDConfig = typeof dataTypeIdConfig

export const dataTypeIdKeys = Object.keys(dataTypeIdConfig)
export type DataTypeIDKey = keyof DataTypeIDConfig

export const dataTypeIds = Object.values(dataTypeIdConfig)
export type DataTypeID = (typeof dataTypeIds)[number]
