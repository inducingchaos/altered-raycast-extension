import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api"
import { usePrompts } from "./hooks/usePrompts"
import { useState, useEffect, useRef } from "react"

export default function Settings() {
    console.log("Settings component rendering")

    // Track if this is the first render
    const isFirstRender = useRef(true)

    // Get prompts data
    const { prompts, isLoading, updatePrompts } = usePrompts()
    console.log("From hook - prompts:", prompts.length, "isLoading:", isLoading)

    // Keep track of which form is rendered
    const [formKey, setFormKey] = useState(0)

    // Effect to stabilize the form after data loads
    useEffect(() => {
        console.log("Data loading effect - prompts length:", prompts.length, "isLoading:", isLoading)

        // Once data is loaded and it's not the first render, generate a new form key
        if (!isLoading && prompts.length > 0 && !isFirstRender.current) {
            console.log("Setting new form key to stabilize")
            setFormKey(prev => prev + 1)
        }

        // Clear first render flag
        if (isFirstRender.current) {
            isFirstRender.current = false
        }
    }, [isLoading, prompts])

    const { pop } = useNavigation()

    // Handle form submission
    const handleSubmit = async (values: Record<string, string>) => {
        console.log("Form submitted with values:", Object.keys(values).length)

        // Map form values to prompt updates
        const updatedPrompts = prompts
            .filter(prompt => values[prompt.id] !== prompt.content)
            .map(prompt => ({
                id: prompt.id,
                content: values[prompt.id] || "",
                name: prompt.name
            }))

        console.log("Prompts to update:", updatedPrompts.length)

        if (updatedPrompts.length > 0) {
            await updatePrompts(updatedPrompts)
            pop()
        }
    }

    // Helper function to generate variable info text
    const getVariableInfoText = (allowedVariables?: string[]) => {
        if (!allowedVariables || allowedVariables.length === 0) {
            return "No template variables available for this prompt."
        }

        return `Available variables: ${allowedVariables.map(v => `{{ ${v} }}`).join(", ")}`
    }

    // Render loading state while data is loading
    if (isLoading && prompts.length === 0) {
        console.log("Rendering loading state")
        return (
            <Form isLoading={true}>
                <Form.Description title="System Prompts" text="Loading system prompts..." />
            </Form>
        )
    }

    console.log("Rendering main form with key:", formKey)

    return (
        <Form
            key={formKey}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Save Changes" icon={Icon.Check} onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.Description
                title="System Prompts"
                text="Modify the system prompts used by different components of the application. Use {{ variableName }} syntax for template variables. Hover over the info icon (ⓘ) next to each field to see available variables."
            />

            {prompts.map(prompt => {
                console.log("Rendering prompt field:", prompt.id, prompt.name)
                return (
                    <Form.TextArea
                        key={prompt.id}
                        id={prompt.id}
                        title={prompt.name}
                        defaultValue={prompt.content}
                        info={getVariableInfoText(prompt.allowedVariables)}
                        enableMarkdown={false}
                    />
                )
            })}
        </Form>
    )
}
