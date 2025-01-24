/**
 *
 */

export const thoughtsSchema: DataSchema = {
    id: "TQaS_SXyTsqtGe9n1SGf9",
    name: "Thoughts",
    system: true,
    columns: [
        {
            id: "MMHOmgsJQxeV-gpMzdrYi",
            type: "Text",
            label: "Content",
            description: "The description of your thought."
        },
        {
            id: "mYNciYMKJ55Fru9VthoQn",
            type: "Text",
            label: "Alias",
            description: "A name for your thought."
        },
        {
            id: "yZH80hj9sdIOnKfJC79jV",
            type: "Number",
            label: "Priority",
            description: "Level of significance."
        },
        {
            id: "NPi6hNEOIla8x2sWPk1Cd",
            type: "Select",
            label: "Attachment",
            description: "A related asset."
        },
        {
            id: "DB6mqwxC2_72zFcd3RN9K",
            type: "Text",
            label: "Tags",
            description: "Categories for indexing."
        },
        {
            id: "F8xcTSyUXYd0eJ3i80Far",
            type: "Number",
            label: "Urgency",
            description: "How urgent this thought is."
        }
    ]
}
