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

export interface ThoughtListItemProps {
    thought: Thought
    onDelete: (id: string, force?: boolean) => Promise<void>
    massThoughtDeletion: (thoughts: Thought[], force?: boolean) => Promise<void>
    toggleValidation: (thought: Thought) => Promise<void>
    toggleMassThoughtValidation?: (thoughts: Thought[], validated: string) => Promise<void>
    onEdit: (thought: Thought, fields: ThoughtFormFields) => Promise<void>
    inspectorVisibility: "hidden" | "compact" | "expanded"
    toggleInspector: () => void
    toggleInspectorMode: () => void
    isSelected: boolean
    isMassSelected: boolean
    toggleMassSelection: () => void
    massSelectionItems: Set<string>
    handleMassSelectAll: () => void
    isAllMassSelected: boolean
    allThoughts: Thought[] | undefined
    resetMassSelection: () => void
    globalActions: { validateAllThoughts: () => Promise<void> }
    createDataset: (title: string) => Promise<{ title: string; id: string }>
    datasets: Dataset[] | undefined
    isLoadingDatasets: boolean
    isLoadingThoughts: boolean
    handleDragSelection?: (direction: "up" | "down") => void
    handleGapSelection?: () => void
    sharedActionPanel: React.ReactNode
    handleTabNavigation?: (direction: "next" | "previous") => void
    handleParameterCycle?: (direction: "next" | "previous") => void
    focusedParameter?: string
}

export type ThoughtFormProps = {
    thought: Thought
    onSubmit: (fields: ThoughtFormFields) => Promise<void>
    createDataset: (title: string) => Promise<{ title: string; id: string }>
    datasets?: Dataset[]
    isLoadingDatasets: boolean
}
