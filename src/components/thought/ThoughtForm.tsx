import { Action, ActionPanel, Form, Icon, showToast, Toast, useNavigation } from "@raycast/api"
import { useEffect, useState } from "react"
import { Dataset } from "src/types/dataset"
import { ThoughtFormFields, ThoughtFormProps } from "../../types/thought"
import { ALWAYS_VISIBLE_METADATA, formatDate, FRONTEND_HIDDEN_FIELDS, getThoughtAlias } from "../../utils/thought"
import { DatasetForm } from "../dataset/DatasetForm"

const DEV_BASE_URL = "http://localhost:5873"

export function ThoughtForm({ thought, onSubmit, createDataset, datasets, isLoadingDatasets }: ThoughtFormProps) {
    const { pop } = useNavigation()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form values
    const [content, setContent] = useState(thought.content)
    const [devNotes, setDevNotes] = useState((thought["devNotes"] as string) || "")
    const [alias, setAlias] = useState(getThoughtAlias(thought))
    const [selectedDatasets, setSelectedDatasets] = useState<string[]>(thought.datasets ?? [])
    const [priority, setPriority] = useState<string>(thought.priority ?? "")

    // Create state for custom fields
    const [customFields, setCustomFields] = useState<Record<string, string>>({})

    // Initialize custom fields from thought object
    useEffect(() => {
        const fields: Record<string, string> = {}
        Object.entries(thought).forEach(([key, value]) => {
            if (
                ![
                    "id",
                    "content",
                    "attachmentId",
                    "createdAt",
                    "updatedAt",
                    "alias",
                    "validated",
                    "datasets",
                    "devNotes",
                    "priority"
                ].includes(key) &&
                !FRONTEND_HIDDEN_FIELDS.includes(key) &&
                value !== null &&
                value !== undefined
            ) {
                fields[key] = String(value)
            }
        })
        setCustomFields(fields)
    }, [])

    const handleSubmit = async (validateOnSave: boolean = false) => {
        setIsSubmitting(true)

        try {
            // Combine all fields - always set validated as a string
            const updatedFields: ThoughtFormFields = {
                content,
                alias,
                devNotes,
                validated: validateOnSave ? "true" : "false",
                datasets: selectedDatasets,
                priority,
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

    const orphanedThoughtDatasetIDs = thought.datasets?.filter(
        datasetId => !datasets?.some(dataset => dataset.id === datasetId)
    )

    const [unfrozenDatasets, setUnfrozenDatasets] = useState<Dataset[] | undefined>(datasets)

    // this useEffect may be necessary to a) have local state that ACTUALLY updates when we create a new dataset, and b) to receive any global updates that *may* come through

    // TBH no global updates seem to come through at all so we should really throw inside this (with the exception of getting initial data when the form is opened)
    useEffect(() => {
        setUnfrozenDatasets(datasets)
    }, [datasets])

    const [errorMap, setErrorMap] = useState<Record<string, string | null>>({})

    // Determine which fields to render based on ALWAYS_VISIBLE_METADATA
    const renderFormFields = () => {
        return (
            <>
                {ALWAYS_VISIBLE_METADATA.includes("content") && (
                    <Form.TextArea id="content" title="Content" value={content} onChange={setContent} />
                )}

                {ALWAYS_VISIBLE_METADATA.includes("devNotes") && (
                    <Form.TextArea id="dev-notes" title="Dev Notes" value={devNotes} onChange={setDevNotes} />
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
                        {/* We include orphaned datasets in the dropdown to allow users to identify and remove them */}
                        {isLoadingDatasets ? (
                            <Form.TagPicker.Item key="loading" value="loading" title="Loading datasets..." />
                        ) : (
                            [
                                ...(unfrozenDatasets ? unfrozenDatasets : []),
                                ...(orphanedThoughtDatasetIDs?.map(id => ({
                                    id,
                                    title: `Invalid Dataset`
                                })) ?? [])
                            ]?.map(dataset => <Form.TagPicker.Item key={dataset.id} value={dataset.id} title={dataset.title} />)
                        )}
                    </Form.TagPicker>
                )}

                {ALWAYS_VISIBLE_METADATA.includes("priority") && (
                    <Form.TextField
                        id="priority"
                        title="Priority"
                        placeholder="0-10 (e.g. 9.3)"
                        value={priority?.toString() ?? ""}
                        onChange={setPriority}
                        error={errorMap.priority ?? undefined}
                        onFocus={() => {
                            setErrorMap(prev => ({ ...prev, priority: null }))
                        }}
                        onBlur={() => {
                            // double check logic
                            const num = parseFloat(priority)
                            if (priority === "") {
                                setErrorMap(prev => ({ ...prev, priority: "Priority is required" }))
                            } else if (!isNaN(num) && num >= 0 && num <= 10) {
                                setErrorMap(prev => ({ ...prev, priority: null }))
                            } else if (isNaN(num)) {
                                setErrorMap(prev => ({ ...prev, priority: "Priority must be a number" }))
                            } else if (num.toFixed(1) !== num.toString() || num.toString().length > 3) {
                                setErrorMap(prev => ({ ...prev, priority: "Priority must be a single decimal place" }))
                            } else {
                                setErrorMap(prev => ({ ...prev, priority: "Priority must be between 0 and 10" }))
                            }
                        }}
                    />
                )}
            </>
        )
    }

    return (
        <Form
            isLoading={isSubmitting || isLoadingDatasets}
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
                        target={
                            <DatasetForm
                                thoughtFormDatasets={unfrozenDatasets ?? []}
                                updateThoughtFormDatasets={setUnfrozenDatasets}
                                onSubmit={createDataset}
                            />
                        }
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
