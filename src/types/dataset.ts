export type Dataset = {
    id: string
    title: string
}

export type DatasetFormProps = {
    onSubmit: (title: string) => Promise<{ title: string; id: string }>
    updateThoughtFormDatasets: (datasets: Dataset[]) => void
    thoughtFormDatasets: Dataset[]
}

// Update Thought type to include datasets
export type ThoughtDatasets = {
    datasets?: string[] // Array of dataset IDs
}
