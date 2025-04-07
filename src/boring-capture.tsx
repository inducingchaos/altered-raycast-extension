import { Action, ActionPanel, Form, showToast, Toast, getPreferenceValues } from "@raycast/api"
import { useState } from "react"
import "~/domains/shared/utils/polyfills"

type ThoughtFormFields = {
    TEMP_content: string
    TEMP_devNotes?: string
    TEMP_alias?: string
    TEMP_priority?: string
    TEMP_sensitive?: string
    TEMP_datasets?: string[]
}

export default function BoringCapture() {
    const [content, setContent] = useState("")
    const [alias, setAlias] = useState("")
    const [devNotes, setDevNotes] = useState("")
    const [priority, setPriority] = useState("")
    const [sensitive, setSensitive] = useState(false)

    const handleSubmit = async () => {
        try {
            const thoughtData: ThoughtFormFields = {
                TEMP_content: content,
                TEMP_devNotes: devNotes || undefined,
                TEMP_alias: alias || undefined,
                TEMP_priority: priority || undefined,
                TEMP_sensitive: sensitive ? "true" : undefined,
                TEMP_datasets: undefined
            }

            const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()

            const response = await fetch("http://localhost:5873/api/thoughts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify([thoughtData])
            })

            if (!response.ok) {
                throw new Error(`Failed to create thought: ${response.statusText}`)
            }

            showToast({
                style: Toast.Style.Success,
                title: "Thought captured"
            })

            // Reset form
            setContent("")
            setAlias("")
            setDevNotes("")
            setPriority("")
            setSensitive(false)
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to capture thought",
                message: error instanceof Error ? error.message : String(error)
            })
        }
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Capture Thought" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField
                id="content"
                title="Content"
                placeholder="Enter your thought..."
                value={content}
                onChange={setContent}
                autoFocus
            />
            <Form.TextField id="alias" title="Alias" placeholder="Optional alias..." value={alias} onChange={setAlias} />
            <Form.TextField
                id="devNotes"
                title="Dev Notes"
                placeholder="Optional developer notes..."
                value={devNotes}
                onChange={setDevNotes}
            />
            <Form.TextField
                id="priority"
                title="Priority"
                placeholder="0-10"
                value={priority}
                onChange={value => {
                    const num = parseInt(value)
                    if (!value || (num >= 0 && num <= 10)) {
                        setPriority(value)
                    }
                }}
            />
            <Form.Checkbox
                id="sensitive"
                title="Sensitive"
                label="Mark as sensitive"
                value={sensitive}
                onChange={setSensitive}
            />
        </Form>
    )
}
