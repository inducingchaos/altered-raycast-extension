/**
 *
 */

// spell-checker: disable

import { nanoid } from "nanoid"
import { dataTypes, SerializableDataSchema } from "../../definitions"
import { max10Rule, maxLength255Rule, min0Rule } from "../rules"

export const thoughtsSchema: SerializableDataSchema = {
    id: nanoid(),
    name: "Thoughts",
    description: "A collection of the thoughts in your ALTERED brain.",
    system: true,

    columns: [
        {
            id: nanoid(),
            name: "Content",
            description: "The description of your thought.",
            default: null,

            type: dataTypes.string.id,
            required: true,
            // function: null,
            rules: [maxLength255Rule]
        },
        {
            id: nanoid(),
            name: "Alias",
            description: "A name for your thought.",

            type: "string",
            required: false,
            default: null,
            // function: null,
            rules: []
        },
        {
            id: nanoid(),
            type: dataTypes.number.id,
            required: false,
            default: null,
            // function: {
            //     type: "range",
            //     parameters: {
            //         min: 0,
            //         max: 10,
            //         step: 1
            //     }
            // },
            name: "Priority",
            description: "Level of significance.",
            rules: [min0Rule, max10Rule]
        },
        {
            id: nanoid(),
            name: "Attachment",
            description: "A related asset.",
            default: null,
            type: dataTypes.string.id,
            required: false,
            // function: null,
            rules: []
        },
        {
            id: nanoid(),
            name: "Tags",
            description: "Categories for indexing.",
            default: null,
            type: dataTypes.string.id,
            required: false,
            // function: null,
            rules: []
        },
        {
            id: nanoid(),
            name: "Validated",
            description: "Whether the thought has been validated.",
            default: "False",

            type: dataTypes.boolean.id,
            required: false,
            rules: []
        },

        // make default and required mutually exclusive

        {
            id: nanoid(),
            name: "Sensitive",
            description: "Whether the thought is sensitive.",
            default: "False",

            type: dataTypes.boolean.id,
            required: false,
            rules: []
        },

        {
            id: nanoid(),
            name: "Datasets",
            description: "Whether the thought is sensitive.",
            default: "False",

            type: dataTypes.boolean.id,
            required: false,
            rules: []
        },

        {
            id: nanoid(),
            type: dataTypes.string.id,
            required: false,
            default: null,
            // function: {
            //     type: "select",
            //     options: ["iOS", "macOS", "watchOS"]
            // },
            name: "Operating System",
            description: "The operating system of the device.",
            rules: []
        }
    ]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const serializableSchema = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const deserializeSchema = (schema: SerializableSchema) => {}
