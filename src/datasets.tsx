import { Action, ActionPanel, Alert, Form, Icon, List, showToast, Toast, confirmAlert, Color } from "@raycast/api"
import { useState } from "react"
import { useDatasets } from "./hooks/useDatasets"
import { Dataset } from "./types/dataset"
import { useNavigation } from "@raycast/api"

// Create dataset form component
function CreateDatasetForm({ onCreate }: { onCreate: (title: string, description?: string) => Promise<void> }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { pop } = useNavigation()

    const handleSubmit = async () => {
        if (!title.trim()) {
            showToast({
                style: Toast.Style.Failure,
                title: "Title is required"
            })
            return
        }

        setIsLoading(true)
        try {
            await onCreate(title.trim(), description.trim() || undefined)
            pop()
        } catch (error) {
            console.error("Error in form:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form
            isLoading={isLoading}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Create Dataset" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField
                id="title"
                title="Title"
                placeholder="Enter dataset title"
                value={title}
                onChange={setTitle}
                autoFocus
            />
            <Form.TextArea
                id="description"
                title="Description"
                placeholder="Enter dataset description (optional)"
                value={description}
                onChange={setDescription}
            />
        </Form>
    )
}

// Edit dataset form component
function EditDatasetForm({
    dataset,
    onEdit
}: {
    dataset: Dataset
    onEdit: (id: string, title: string, description?: string) => Promise<void>
}) {
    const [title, setTitle] = useState(dataset.title)
    const [description, setDescription] = useState(dataset.description || "")
    const [isLoading, setIsLoading] = useState(false)

    const { pop } = useNavigation()

    const handleSubmit = async () => {
        if (!title.trim()) {
            showToast({
                style: Toast.Style.Failure,
                title: "Title is required"
            })
            return
        }

        setIsLoading(true)
        try {
            await onEdit(dataset.id, title.trim(), description.trim() || undefined)
        } catch (error) {
            console.error("Error in form:", error)
        } finally {
            setIsLoading(false)
        }
        pop()
    }

    return (
        <Form
            isLoading={isLoading}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Update Dataset" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField
                id="title"
                title="Title"
                placeholder="Enter dataset title"
                value={title}
                onChange={setTitle}
                autoFocus
            />
            <Form.TextArea
                id="description"
                title="Description"
                placeholder="Enter dataset description (optional)"
                value={description}
                onChange={setDescription}
            />
        </Form>
    )
}

export default function Datasets() {
    const [searchText, setSearchText] = useState("")
    const { datasets, isLoading, deleteDataset, createDataset, editDataset } = useDatasets(searchText)

    const handleDeleteDataset = async (datasetId: string, datasetTitle: string) => {
        try {
            await deleteDataset(datasetId)
            showToast({
                style: Toast.Style.Success,
                title: "Dataset deleted",
                message: `"${datasetTitle}" was successfully deleted`
            })
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to delete dataset",
                message: error instanceof Error ? error.message : String(error)
            })
        }
    }

    const handleCreateDataset = async (title: string, description?: string) => {
        try {
            await createDataset(title, description)
            showToast({
                style: Toast.Style.Success,
                title: "Dataset created",
                message: `"${title}" was successfully created`
            })
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to create dataset",
                message: error instanceof Error ? error.message : String(error)
            })
            throw error
        }
    }

    const handleEditDataset = async (id: string, title: string, description?: string) => {
        try {
            await editDataset(id, title, description)
            showToast({
                style: Toast.Style.Success,
                title: "Dataset updated",
                message: `Dataset was successfully updated to "${title}"`
            })
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to update dataset",
                message: error instanceof Error ? error.message : String(error)
            })
            throw error
        }
    }

    // Function to get thought count text
    const getThoughtsCountText = (dataset: Dataset): string | undefined => {
        if (!dataset.thoughts || dataset.thoughts.length === 0) {
            return undefined
        }
        return `${dataset.thoughts.length} Thought${dataset.thoughts.length === 1 ? "" : "s"}`
    }

    const datasetCount = datasets?.length ?? 0

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder="Search datasets..."
            throttle
            navigationTitle={`Datasets${datasetCount > 0 ? ` (${datasetCount})` : ""}`}
            actions={
                <ActionPanel>
                    <Action.Push
                        title="Create New Dataset"
                        icon={Icon.Plus}
                        shortcut={{ modifiers: ["cmd"], key: "n" }}
                        target={<CreateDatasetForm onCreate={handleCreateDataset} />}
                    />
                </ActionPanel>
            }
        >
            {datasets?.map(dataset => (
                <List.Item
                    key={dataset.id}
                    title={dataset.title}
                    subtitle={dataset.description}
                    accessories={
                        [
                            dataset.thoughts?.length
                                ? {
                                      text: { value: getThoughtsCountText(dataset), color: Color.PrimaryText }
                                  }
                                : undefined,

                            dataset.createdAt
                                ? {
                                      date: new Date(dataset.createdAt),
                                      tooltip: "Created on"
                                  }
                                : undefined
                        ].filter(Boolean) as { text: { value: string; color: Color } | undefined }[]
                    }
                    actions={
                        <ActionPanel>
                            <Action.Push
                                title="Create New Dataset"
                                icon={Icon.Plus}
                                shortcut={{ modifiers: ["cmd"], key: "n" }}
                                target={<CreateDatasetForm onCreate={handleCreateDataset} />}
                            />
                            <Action.Push
                                title="Edit Dataset"
                                icon={Icon.Pencil}
                                shortcut={{ modifiers: ["cmd"], key: "e" }}
                                target={<EditDatasetForm dataset={dataset} onEdit={handleEditDataset} />}
                            />
                            <Action.CopyToClipboard
                                title="Copy Dataset Title"
                                content={dataset.title}
                                shortcut={{ modifiers: ["cmd"], key: "." }}
                            />
                            <Action
                                title="Delete Dataset"
                                icon={Icon.Trash}
                                style={Action.Style.Destructive}
                                shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                                onAction={() => {
                                    const hasAssociatedThoughts = dataset.thoughts && dataset.thoughts.length > 0

                                    if (hasAssociatedThoughts) {
                                        confirmAlert({
                                            title: "Delete Dataset",
                                            message: `This dataset has ${dataset.thoughts!.length} thought${dataset.thoughts!.length === 1 ? "" : "s"} associated with it. Are you sure you want to delete "${dataset.title}"?`,
                                            primaryAction: {
                                                title: "Delete",
                                                style: Alert.ActionStyle.Destructive,
                                                onAction: () => handleDeleteDataset(dataset.id, dataset.title)
                                            }
                                        })
                                    } else {
                                        // No associated thoughts, delete without confirmation
                                        handleDeleteDataset(dataset.id, dataset.title)
                                    }
                                }}
                            />
                        </ActionPanel>
                    }
                />
            ))}

            {datasets?.length === 0 && (
                <List.EmptyView
                    title="No Datasets Found"
                    description="Try creating a new dataset or adjusting your search."
                    actions={
                        <ActionPanel>
                            <Action.Push
                                title="Create New Dataset"
                                icon={Icon.Plus}
                                target={<CreateDatasetForm onCreate={handleCreateDataset} />}
                            />
                        </ActionPanel>
                    }
                />
            )}
        </List>
    )
}
