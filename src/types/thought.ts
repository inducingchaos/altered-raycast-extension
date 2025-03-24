import { AiFeature } from "src/hooks/useAiFeatures"
import { Dataset } from "./dataset"
import { AiModel } from "src/hooks/useAiModels"

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

export type ThoughtFormFields = {
    content: string
    alias: string
    validated: string // Always "true" or "false" as a string
    datasets: string[]
    [key: string]: string | string[] // Other custom fields
}

export type ThoughtListItemProps = {
    thought: Thought
    onDelete: (id: string) => Promise<void>
    massThoughtDeletion: (thoughts: Thought[]) => Promise<void>
    toggleValidation: (thought: Thought) => Promise<void>
    toggleMassThoughtValidation?: (thoughts: Thought[], targetValidationState: string) => Promise<void>
    onEdit: (thought: Thought, updatedFields: ThoughtFormFields) => Promise<void>
    inspectorVisibility: "visible" | "hidden"
    toggleInspector: () => void
    isSelected: boolean
    toggleRawMode?: () => void // Optional since not all components may use it
    toggleLargeTypeMode?: () => void // Optional toggle for Large Type Mode
    isRawMode?: boolean // The raw mode state, controlled by parent
    isMassSelected: boolean
    toggleMassSelection: () => void
    massSelectionItems: Set<string>
    handleMassSelectAll: () => void
    isAllMassSelected: boolean
    allThoughts?: Thought[] // All filtered thoughts for validation logic
    resetMassSelection: () => void // Function to clear mass selection
    globalActions?: {
        validateAllThoughts: () => Promise<void>
    }
    createDataset: (title: string) => Promise<void>
    datasets?: Dataset[]
    isLoadingDatasets: boolean
    initialData: { values: { features?: AiFeature[]; models?: AiModel[] }; isLoading: boolean }
}

export type ThoughtFormProps = {
    thought: Thought
    onSubmit: (fields: ThoughtFormFields) => Promise<void>
    createDataset: (title: string) => Promise<void>
    datasets?: Dataset[]
    isLoadingDatasets: boolean
}
