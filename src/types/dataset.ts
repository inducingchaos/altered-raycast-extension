export type Dataset = {
    id: string
    title: string
    description?: string
    createdAt?: string
    thoughts?: string[] // Array of thought IDs
    thoughtCount: number // Total number of thoughts in this dataset
}

export type DatasetFormProps = {
    onSubmit: (title: string, description?: string) => Promise<{ title: string; id: string }>
    updateThoughtFormDatasets: (datasets: Dataset[]) => void
    thoughtFormDatasets: Dataset[]
}

// Update Thought type to include datasets
export type ThoughtDatasets = {
    datasets?: string[] // Array of dataset IDs
}
