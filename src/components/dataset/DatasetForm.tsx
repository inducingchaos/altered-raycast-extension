import { Action, ActionPanel, Form, useNavigation } from "@raycast/api"
import { useState } from "react"
import { DatasetFormProps } from "../../types/dataset"

export function DatasetForm({ onSubmit, updateThoughtFormDatasets, thoughtFormDatasets }: DatasetFormProps) {
    const { pop } = useNavigation()
    const [title, setTitle] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const newDataset = await onSubmit(title)
            pop()
            // after relocating the useDatasets hook to the parent, the ThoughtForm component would NOT update the datasets field options even though the ThoughtItemList (parent component) would get them and trigger a useEffect.
            //  We tried pop/push to recreate the form, etc - but ultimately it seems internally memoized???
            // So the solution was to create a PROXY state inside the form to optimistically update the datasets.

            // That's why we return from createDataset and optimistically update here - so we can have the REAL ID and title in the list that also corresponds to the actual dataset being created.

            updateThoughtFormDatasets([...thoughtFormDatasets, newDataset])
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
