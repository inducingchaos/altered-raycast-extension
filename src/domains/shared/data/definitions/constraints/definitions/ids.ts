/**
 *
 */

// spell-checker: disable

export const dataConstraintUids = {
    required: "QFWPHA5M6P5Xw9sROR3w9",

    length: "x_TXxF1Ver4jz9prlbgBc",

    // "min-value": "mNg5N_8JHaHFKNBcpI8qS",
    // "max-value": "CJ8vywlYpE90X5u9uR48w",

    range: "3Ilbtz7WRBP77q8zU3iyw",
    options: "aO5qoD7kkNEmxbMIJYlED"
} as const

export const dataConstraintIds = Object.keys(dataConstraintUids)
export type DataConstraintID = keyof typeof dataConstraintUids
