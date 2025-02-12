/**
 *
 */

// spell-checker: disable

import { dataTypes, SerializableDataSchema } from "../../../definitions"
import { max10Rule, maxLength255Rule, min0Rule } from "../../rules"

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
            rules: [maxLength255Rule]
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
            rules: [min0Rule, max10Rule]
        },
        {
            name: "Sensitive",
            description: "Whether the thought is sensitive.",
            type: dataTypes.boolean.id,
            required: true,
            default: "false"
        }
    ]
}

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
