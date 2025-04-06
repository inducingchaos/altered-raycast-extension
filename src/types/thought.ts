import { Dataset } from "./dataset"

export type Thought = {
    id: string
    userId: string
    content: string
    attachmentId: string | null
    createdAt: Date
    updatedAt: Date
    datasets?: string[] // Array of dataset IDs
    validated?: string // Should always be "true" or "false" string
    devNotes?: string // Developer notes about the thought
    priority?: string // Priority level (0-10)
    sensitive?: string // Should always be "true" or "false" string
    // Dynamic key-value pairs appended to the thought object
    [key: string]: string | number | Date | null | boolean | string[] | undefined
}

export type ThoughtFormFields = {
    content: string
    alias: string
    validated: string // Always "true" or "false" as a string
    datasets: string[]
    devNotes?: string // Developer notes about the thought
    priority?: string // Priority level (0-10)
    sensitive?: string // Always "true" or "false" as a string
    [key: string]: string | string[] | undefined // Other custom fields
}

export type ThoughtListItemProps = {
    thought: Thought
    onDelete: (id: string, forceDelete?: boolean) => Promise<void>
    massThoughtDeletion: (thoughts: Thought[], forceDelete?: boolean) => Promise<void>
    toggleValidation: (thought: Thought) => Promise<void>
    toggleMassThoughtValidation?: (thoughts: Thought[], targetValidationState: string) => Promise<void>
    onEdit: (thought: Thought, updatedFields: ThoughtFormFields) => Promise<void>
    inspectorVisibility: "visible" | "hidden" | "expanded"
    toggleInspector: (mode?: "visible" | "hidden" | "expanded") => void
    isSelected: boolean
    isMassSelected: boolean
    toggleMassSelection: () => void
    massSelectionItems: Set<string>
    handleMassSelectAll: () => void
    isAllMassSelected: boolean
    allThoughts?: Thought[] // All filtered thoughts for validation logic
    resetMassSelection: () => void // Function to clear mass selection
    handleDragSelection?: (direction: "up" | "down") => void // Optional drag selection handler
    handleGapSelection?: () => void // Optional gap selection handler
    handleTabNavigation?: (direction: "next" | "previous") => void // Optional tab navigation handler
    globalActions?: {
        validateAllThoughts: () => Promise<void>
    }
    createDataset: (title: string) => Promise<{ title: string; id: string }>
    datasets?: Dataset[]
    isLoadingDatasets: boolean
    isLoadingThoughts: boolean // Whether thoughts are currently loading/updating
    sharedActionPanel?: React.ReactNode // Shared action panel section to reuse across items
}

export type ThoughtFormProps = {
    thought: Thought
    onSubmit: (fields: ThoughtFormFields) => Promise<void>
    createDataset: (title: string) => Promise<{ title: string; id: string }>
    datasets?: Dataset[]
    isLoadingDatasets: boolean
}
