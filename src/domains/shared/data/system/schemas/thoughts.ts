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
            label: "Content",
            description: "The description of your thought.",
            default: null,

            type: dataTypes.string.id,
            required: true,
            // function: null,
            rules: [maxLength255Rule]
        },
        {
            id: nanoid(),
            label: "Alias",
            description: "A name for your thought.",
            default: null,

            type: dataTypes.string.id,
            required: false,
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
            label: "Priority",
            description: "Level of significance.",
            rules: [min0Rule, max10Rule]
        },
        {
            id: nanoid(),
            label: "Attachment",
            description: "A related asset.",
            default: null,
            type: dataTypes.string.id,
            required: false,
            // function: null,
            rules: []
        },
        {
            id: nanoid(),
            label: "Tags",
            description: "Categories for indexing.",
            default: null,
            type: dataTypes.string.id,
            required: false,
            // function: null,
            rules: []
        },
        {
            id: nanoid(),
            label: "Validated",
            description: "Whether the thought has been validated.",
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
            label: "Operating System",
            description: "The operating system of the device.",
            rules: []
        }
    ]
}
