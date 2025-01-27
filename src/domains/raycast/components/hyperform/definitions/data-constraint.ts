/**
 *
 */

import { HFDataType } from "./data-type"
import { z } from "zod"

export const hdDataConstraintIds = ["required", "min-length", "max-length", "min-value", "max-value", "range"] as const

export type HFDataConstraintID = (typeof hdDataConstraintIds)[number]

export type HFDataConstraint<Options> = {
    id: HFDataConstraintID
    name: string
    description: string

    options: Options

    tag: {
        label: string | ((options: Options) => string)
        description: string | ((options: Options) => string)
    }
    error?: {
        label?: string | ((options: Options) => string)
        description?: string | ((options: Options) => string)
    }

    types: HFDataType["id"][]
}

// internal

const hfDataConstraints: Record<HFDataConstraintID, HFDataConstraint> = {
    required: {
        id: "required",
        name: "Required",
        options: null,
        types: ["string", "number", "boolean"],

        label: "Required",
        description: "The content cannot be empty."
    },

    minLength: {
        id: "min-length",
        name: "Min Length",
        options: {
            value: "number"
        },
        types: ["string"],

        label: options => `Min Length: ${options.value}`,
        description: options => `The content must be at least ${options.value} character${options.value === 1 ? "" : "s"}.`,
        error: {
            label: "Too Short"
        }
    },
    maxLength: {
        id: "max-length",
        name: "Max Length",
        options: {
            value: "number"
        },
        types: ["string"],

        label: options => `Max Length: ${options.value}`,
        description: options => `The content must be ${options.value} character${options.value === 1 ? "" : "s"} or less.`,
        error: {
            label: "Exceeds Max Length"
        }
    },

    minValue: {
        id: "min-value",
        name: "Min Value",
        options: {
            value: "number"
        },
        types: ["number"],

        label: options => `Min: ${options.value}`,
        description: options => `The value must be greater than or equal to ${options.value}.`,
        error: {
            label: "Below Min Value"
        }
    },
    maxValue: {
        id: "max-value",
        name: "Max Value",
        options: {
            value: "number"
        },
        types: ["number"],

        label: options => `Max: ${options.value}`,
        description: options => `The value must be less than or equal to ${options.value}.`,
        error: {
            label: "Exceeds Max Value"
        }
    },

    range: {
        id: "range",
        name: "Range",
        options: {
            min: "number",
            max: "number",
            interval: ["number", "undefined"]
        },
        types: ["number"],
        supersedes: ["min-value", "max-value"],

        label: options => `Range: ${options.min}-${options.max}`,
        description: options => `The value must be between ${options.min} and ${options.max}.`,
        error: {
            label: "Exceeds Value Range"
        }
    }
} as const

// schema

const dataConstraintConfigurations = [
    {
        id: "max-length",
        options: {
            maxLength: 255
        }
    }
]
