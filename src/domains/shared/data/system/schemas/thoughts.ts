/**
 *
 */

// spell-checker: disable

import { dataTypes } from "../../definitions"
import { max255Rule, requiredRule } from "../rules"

export const thoughtsSchema: DataSchema = {
    id: "TQaS_SXyTsqtGe9n1SGf9",
    name: "Thoughts",
    description: "A collection of the thoughts in your ALTERED brain.",
    system: true,

    columns: [
        {
            id: "MMHOmgsJQxeV-gpMzdrYi",
            label: "Content",
            description: "The description of your thought.",

            type: dataTypes.string.id,
            function: null,
            rules: [requiredRule.id, max255Rule.id]
        },
        {
            id: "mYNciYMKJ55Fru9VthoQn",
            label: "Alias",
            description: "A name for your thought.",

            type: dataTypes.string.id,
            function: null,
            rules: []
        },
        {
            id: "yZH80hj9sdIOnKfJC79jV",
            type: dataTypes.number.id,
            function: {
                type: "range",
                parameters: {
                    min: 0,
                    max: 10,
                    step: 1
                }
            },
            label: "Priority",
            description: "Level of significance."
        },
        {
            id: "NPi6hNEOIla8x2sWPk1Cd",
            type: dataTypes.string.id,
            function: null,
            label: "Attachment",
            description: "A related asset."
        },
        {
            id: "DB6mqwxC2_72zFcd3RN9K",
            type: dataTypes.string.id,
            function: null,
            label: "Tags",
            description: "Categories for indexing."
        },
        {
            id: "F8xcTSyUXYd0eJ3i80Far",
            type: dataTypes.string.id,
            function: {
                type: "select",
                options: ["iOS", "macOS", "watchOS"]
            },
            label: "Operating System",
            description: "The operating system of the device."
        }
    ]
}
