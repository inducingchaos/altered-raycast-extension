/**
 *
 */

export type DataColumn = {
    id: string
    type: string
    label: string
    description: string
}

//  We can't have accessories specific to each column - they need to be dynamically assigned based on the data type and validation rules.

export const dataColumns: DataColumn[] = [
    {
        id: "content",
        type: "Text",
        label: "Content",
        description: "The description of your thought."
    },
    {
        id: "alias",
        type: "Text",
        label: "Alias",
        description: "A name for your thought."
    },
    {
        id: "priority",
        type: "Number",
        label: "Priority",
        description: "Level of significance."
    },
    {
        id: "attachment",
        type: "Select",
        label: "Attachment",
        description: "A related asset."
    },
    {
        id: "tags",
        type: "Text",
        label: "Tags",
        description: "Categories for indexing."
    },
    {
        id: "urgency",
        type: "Number",
        label: "Urgency",
        description: "How urgent this thought is."
    }
]
