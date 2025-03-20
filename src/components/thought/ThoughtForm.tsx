import { Action, ActionPanel, Form, Icon, showToast, Toast } from "@raycast/api"
import { useNavigation } from "@raycast/api"
import { useState } from "react"
import { ThoughtFormFields, ThoughtFormProps } from "../../types/thought"
import { ALWAYS_VISIBLE_METADATA, FRONTEND_HIDDEN_FIELDS, formatDate, getThoughtAlias } from "../../utils/thought"
import { useDatasets } from "../../hooks/useDatasets"
import { DatasetForm } from "../dataset/DatasetForm"

const DEV_BASE_URL = "http://localhost:5873"

export function ThoughtForm({ thought, onSubmit }: ThoughtFormProps) {
    const { pop } = useNavigation()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { datasets, isLoading: isDatasetsLoading, createDataset } = useDatasets()

    // Initialize form values
    const [content, setContent] = useState(thought.content)
    const [alias, setAlias] = useState(getThoughtAlias(thought))
    const [selectedDatasets, setSelectedDatasets] = useState<string[]>(thought.datasets ?? [])

    // Create state for custom fields
    const [customFields, setCustomFields] = useState<Record<string, string>>({})

    // Initialize custom fields from thought object
    useState(() => {
        const fields: Record<string, string> = {}
        Object.entries(thought).forEach(([key, value]) => {
            if (
                !["id", "content", "attachmentId", "createdAt", "updatedAt", "alias", "validated", "datasets"].includes(key) &&
                !FRONTEND_HIDDEN_FIELDS.includes(key) &&
                value !== null &&
                value !== undefined
            ) {
                fields[key] = String(value)
            }
        })
        setCustomFields(fields)
    })

    const handleSubmit = async (validateOnSave: boolean = false) => {
        setIsSubmitting(true)

        try {
            // Combine all fields - always set validated as a string
            const updatedFields: ThoughtFormFields = {
                content,
                alias,
                validated: validateOnSave ? "true" : "false",
                datasets: selectedDatasets,
                // Add any custom fields
                ...Object.entries(customFields).reduce(
                    (acc, [key, value]) => {
                        acc[key] = value
                        return acc
                    },
                    {} as Record<string, string>
                )
            }

            await onSubmit(updatedFields)

            if (validateOnSave) {
                showToast({
                    style: Toast.Style.Success,
                    title: "Thought saved and validated"
                })
            }

            pop()
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to update thought",
                message: error instanceof Error ? error.message : String(error)
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Determine which fields to render based on ALWAYS_VISIBLE_METADATA
    const renderFormFields = () => {
        return (
            <>
                {ALWAYS_VISIBLE_METADATA.includes("content") && (
                    <Form.TextArea id="content" title="Content" value={content} onChange={setContent} />
                )}

                {ALWAYS_VISIBLE_METADATA.includes("alias") && (
                    <Form.TextField
                        id="alias"
                        title="Alias"
                        placeholder="Title for this thought"
                        value={alias}
                        onChange={setAlias}
                    />
                )}

                {ALWAYS_VISIBLE_METADATA.includes("datasets") && (
                    <Form.TagPicker
                        id="datasets"
                        title="Datasets"
                        placeholder="Select datasets"
                        value={selectedDatasets}
                        onChange={setSelectedDatasets}
                    >
                        {datasets?.map(dataset => (
                            <Form.TagPicker.Item key={dataset.id} value={dataset.id} title={dataset.title} />
                        ))}
                    </Form.TagPicker>
                )}
            </>
        )
    }

    return (
        <Form
            isLoading={isSubmitting || isDatasetsLoading}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Save Changes" onSubmit={() => handleSubmit(false)} />
                    <Action
                        title="Save and Validate"
                        icon={Icon.CheckCircle}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "v" }}
                        onAction={() => handleSubmit(true)}
                    />
                    <Action.Push
                        title="Create Dataset"
                        icon={Icon.Plus}
                        shortcut={{ modifiers: ["opt"], key: "d" }}
                        target={<DatasetForm onSubmit={createDataset} />}
                    />
                </ActionPanel>
            }
            searchBarAccessory={<Form.LinkAccessory target={`${DEV_BASE_URL}/thoughts/${thought.id}`} text="Open in ALTERED" />}
        >
            {renderFormFields()}

            {Object.keys(customFields).length > 0 && (
                <>
                    <Form.Description title="" text="" />
                    {Object.entries(customFields).map(([key, value]) => (
                        <Form.TextField
                            key={key}
                            id={key}
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={value}
                            onChange={newValue => {
                                setCustomFields(prev => ({
                                    ...prev,
                                    [key]: newValue
                                }))
                            }}
                        />
                    ))}
                </>
            )}

            {/* Dates information at the bottom */}
            <Form.Description title="" text="" />
            <Form.Description title="Created" text={formatDate(new Date(thought.createdAt))} />
            <Form.Description title="Updated" text={formatDate(new Date(thought.updatedAt))} />
        </Form>
    )
}
