import { Action, ActionPanel, Form, Icon, showToast, Toast } from "@raycast/api"
import { useNavigation } from "@raycast/api"
import { useState } from "react"
import { ThoughtFormProps } from "../../types/thought"
import { EXCLUDED_API_FIELDS, formatDetailDate, getThoughtAlias } from "../../utils/thought"
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
                !EXCLUDED_API_FIELDS.includes(key) &&
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
            const updatedFields: Record<string, string | string[]> = {
                content,
                alias,
                validated: validateOnSave ? "true" : "false",
                datasets: selectedDatasets
            }

            // Add custom fields
            Object.entries(customFields).forEach(([key, value]) => {
                updatedFields[key] = value
            })

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
            <Form.Description title="" text="" />

            <Form.Description title="Created At" text={formatDetailDate(new Date(thought.createdAt))} />
            <Form.Description title="Updated At" text={formatDetailDate(new Date(thought.updatedAt))} />

            <Form.Description title="" text="" />

            <Form.Separator />

            <Form.Description title="" text="" />

            <Form.TextArea id="content" title="Content" value={content} onChange={setContent} />
            <Form.TextField id="alias" title="Alias" info="What info" placeholder="SSD" value={alias} onChange={setAlias} />

            <Form.TagPicker
                id="datasets"
                title="Datasets"
                placeholder="Select datasets"
                value={selectedDatasets}
                onChange={setSelectedDatasets}
            >
                {datasets?.map(dataset => <Form.TagPicker.Item key={dataset.id} value={dataset.id} title={dataset.title} />)}
            </Form.TagPicker>

            <Form.Description title="" text="" />

            {Object.keys(customFields).length > 0 && (
                <>
                    <Form.Separator />

                    <Form.Description title="" text="" />
                </>
            )}

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
        </Form>
    )
}
