import { Action, ActionPanel, Form, useNavigation } from "@raycast/api"
import { useState } from "react"
import { DatasetFormProps } from "../../types/dataset"

export function DatasetForm({ onSubmit }: DatasetFormProps) {
    const { pop } = useNavigation()
    const [title, setTitle] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            await onSubmit(title)
            pop()
        } catch (error) {
            // Error is handled by the onSubmit function
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form
            isLoading={isSubmitting}
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
        </Form>
    )
}
