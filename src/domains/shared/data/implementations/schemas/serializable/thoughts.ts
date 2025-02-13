/**
 *
 */

// spell-checker: disable

import { dataTypes, SerializableDataSchema } from "../../../definitions"
import { createSerializableDataConstraint, dataConstraints } from "../../../definitions/constraints"

// our serializable schema should have everything EXCEPT functions/logic, that needs to be constant in our shared package code

export const serializableThoughtsSchema: SerializableDataSchema = {
    name: "Thoughts",
    description: "A collection of the thoughts in your ALTERED brain.",

    columns: [
        {
            name: "Content",
            description: "The description of your thought.",
            type: dataTypes.string.id,
            required: true,
            constraints: [
                createSerializableDataConstraint({
                    id: dataConstraints["max-length"].id,
                    parameters: {
                        value: 255
                    }
                })
            ]
        },
        {
            name: "Alias",
            description: "A name for your thought.",
            type: dataTypes.string.id,
            required: false
        },
        {
            name: "Priority",
            description: "Level of significance.",
            type: dataTypes.number.id,
            required: false,
            constraints: [
                createSerializableDataConstraint({
                    id: dataConstraints.range.id,
                    parameters: {
                        min: 1.9,
                        max: 11.05,
                        step: {
                            size: 2,
                            offset: 0.25
                        }
                    }
                })
            ]
        },
        {
            name: "Sensitive",
            description: "Whether the thought is sensitive.",
            type: dataTypes.boolean.id,
            required: true,
            default: "false"
        },
        {
            name: "Options Test",
            description: "Allows multiple options.",
            type: dataTypes.string.id,
            required: true,
            default: "now",
            constraints: [
                createSerializableDataConstraint({
                    id: dataConstraints.options.id,
                    parameters: {
                        values: ["now", "soon", "later"]
                    }
                })
            ]
        },
        {
            name: "Number Select Test",
            description: "Allows selecting a number.",
            type: dataTypes.number.id,
            required: true,
            default: "7"
        }
    ]
} as const

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const serializableSchema = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const deserializeSchema = (schema: SerializableSchema) => {}

// function: {
//     type: "range",
//     parameters: {
//         min: 0,
//         max: 10,
//         step: 1
//     }
// },
