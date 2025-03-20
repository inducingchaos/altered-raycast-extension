export type Thought = {
    id: string
    userId: string
    content: string
    attachmentId: string | null
    createdAt: Date
    updatedAt: Date
    datasets?: string[] // Array of dataset IDs
    validated?: string // Should always be "true" or "false" string
    // Dynamic key-value pairs appended to the thought object
    [key: string]: string | number | Date | null | boolean | string[] | undefined
}

export type ThoughtFormFields = Record<string, string | boolean | string[]>

export type ThoughtListItemProps = {
    thought: Thought
    onDelete: (id: string) => Promise<void>
    toggleValidation: (thought: Thought) => Promise<void>
    onEdit: (thought: Thought, updatedFields: ThoughtFormFields) => Promise<void>
    inspectorVisibility: "visible" | "hidden"
    toggleInspector: () => void
    isSelected: boolean
}

export type ThoughtFormProps = {
    thought: Thought
    onSubmit: (fields: ThoughtFormFields) => Promise<void>
}
