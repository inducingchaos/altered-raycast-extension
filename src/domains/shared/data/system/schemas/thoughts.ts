/**
 *
 */

// spell-checker: disable

import { nanoid } from "nanoid"
import { dataTypes, SerializableDataSchema } from "../../definitions"
import { max10Rule, maxLength255Rule, min0Rule, requiredRule } from "../rules"

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

            type: dataTypes.string.id,
            // function: null,
            rules: [requiredRule, maxLength255Rule]
        },
        {
            id: nanoid(),
            label: "Alias",
            description: "A name for your thought.",

            type: dataTypes.string.id,
            // function: null,
            rules: []
        },
        {
            id: nanoid(),
            type: dataTypes.number.id,
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

            type: dataTypes.string.id,
            // function: null,
            rules: []
        },
        {
            id: nanoid(),
            label: "Tags",
            description: "Categories for indexing.",

            type: dataTypes.string.id,
            // function: null,
            rules: [requiredRule]
        },
        {
            id: nanoid(),
            type: dataTypes.string.id,
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
