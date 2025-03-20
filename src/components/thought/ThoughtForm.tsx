import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api"
import { useNavigation } from "@raycast/api"
import { useState } from "react"
import { ThoughtFormProps } from "../../types/thought"
import { formatDetailDate, getThoughtAlias, isThoughtValidated } from "../../utils/thought"

const DEV_BASE_URL = "http://localhost:5873"

export function ThoughtForm({ thought, onSubmit }: ThoughtFormProps) {
    const { pop } = useNavigation()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form values
    const [content, setContent] = useState(thought.content)
    const [alias, setAlias] = useState(getThoughtAlias(thought))
    const [validated, setValidated] = useState(isThoughtValidated(thought))

    // Create state for custom fields
    const [customFields, setCustomFields] = useState<Record<string, string>>({})

    // Initialize custom fields from thought object
    useState(() => {
        const fields: Record<string, string> = {}
        Object.entries(thought).forEach(([key, value]) => {
            if (
                !["id", "content", "attachmentId", "createdAt", "updatedAt", "alias", "validated"].includes(key) &&
                value !== null &&
                value !== undefined
            ) {
                fields[key] = String(value)
            }
        })
        setCustomFields(fields)
    })

    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            // Combine all fields
            const updatedFields: Record<string, string | boolean> = {
                content,
                alias,
                validated
            }

            // Add custom fields
            Object.entries(customFields).forEach(([key, value]) => {
                updatedFields[key] = value
            })

            await onSubmit(updatedFields)
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
            isLoading={isSubmitting}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Save Changes" onSubmit={handleSubmit} />
                </ActionPanel>
            }
            searchBarAccessory={<Form.LinkAccessory target={`${DEV_BASE_URL}/thoughts/${thought.id}`} text="Open in ALTERED" />}
        >
            <Form.Description text="Text" />
            <Form.DatePicker id="createdAt" title="Created At" value={new Date(thought.createdAt)} />
            <Form.DatePicker id="updatedAt" title="Updated At" value={new Date(thought.updatedAt)} />

            <Form.TextArea id="content" title="Content" value={content} onChange={setContent} />
            <Form.TextField id="alias" title="Alias" info="What info" placeholder="SSD" value={alias} onChange={setAlias} />

            <Form.Description title="Title" text="Text" />

            <Form.Checkbox
                id="validated"
                label="True"
                info="What info"
                title="Validated"
                value={validated}
                onChange={setValidated}
            />
            <Form.Separator />

            <Form.Description title="Metadata" text="Non-editable parameters." />
            <Form.Description title="Created At" text={formatDetailDate(new Date(thought.createdAt))} />
            <Form.Description title="Updated At" text={formatDetailDate(new Date(thought.updatedAt))} />

            <Form.Separator />
            <Form.Description title="Custom Fields" text="Additional properties" />

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
