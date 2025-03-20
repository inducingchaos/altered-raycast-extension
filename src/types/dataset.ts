export type Dataset = {
    id: string
    title: string
}

export type DatasetFormProps = {
    onSubmit: (title: string) => Promise<void>
}

// Update Thought type to include datasets
export type ThoughtDatasets = {
    datasets?: string[] // Array of dataset IDs
}
