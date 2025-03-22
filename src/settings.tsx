import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api"
import { usePrompts } from "./hooks/usePrompts"
import { useState, useEffect, useRef, useMemo } from "react"
import { useAiFeatures } from "./hooks/useAiFeatures"
import { useAiModels, AiModel } from "./hooks/useAiModels"

export default function Settings() {
    console.log("Settings component rendering")

    // Track if this is the first render
    const isFirstRender = useRef(true)

    // Get prompts data
    const { prompts, isLoading: isLoadingPrompts, updatePrompts } = usePrompts()
    console.log("From hook - prompts:", prompts.length, "isLoading:", isLoadingPrompts)

    // Get AI features and models
    const { features, isLoading: isLoadingFeatures, isUpdatingFeature, updateFeatureModel } = useAiFeatures()
    const { models, isLoading: isLoadingModels } = useAiModels()

    // Group models by provider
    const modelsByProvider = useMemo(() => {
        const grouped: Record<string, AiModel[]> = {}

        models.forEach(model => {
            if (!grouped[model.provider.id]) {
                grouped[model.provider.id] = []
            }
            grouped[model.provider.id].push(model)
        })

        return grouped
    }, [models])

    // Keep track of which form is rendered
    const [formKey, setFormKey] = useState(0)

    // Effect to stabilize the form after data loads
    useEffect(() => {
        console.log("Data loading effect - prompts length:", prompts.length, "isLoading:", isLoadingPrompts)

        // Once data is loaded and it's not the first render, generate a new form key
        if (!isLoadingPrompts && prompts.length > 0 && !isFirstRender.current) {
            console.log("Setting new form key to stabilize")
            setFormKey(prev => prev + 1)
        }

        // Clear first render flag
        if (isFirstRender.current) {
            isFirstRender.current = false
        }
    }, [isLoadingPrompts, prompts])

    const { pop } = useNavigation()

    // Handle form submission
    const handleSubmit = async (values: Record<string, string>) => {
        console.log("Form submitted with values:", Object.keys(values).length)

        // Handle prompt updates
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
        }

        // Handle model preference updates
        const modelUpdatePromises = features.map(async feature => {
            const newModelIdValue = values[`model_${feature.id}`]
            // null means reset to default
            const modelToSet = newModelIdValue === "default" ? null : newModelIdValue

            // Check if we're switching between default and non-default
            const currentlyUsingDefault = feature.model.isDefault
            const wantToUseDefault = newModelIdValue === "default"

            // Update if:
            // 1. The selected model ID is different from the current one
            // 2. OR we're switching between default and non-default mode
            const needsUpdate =
                (feature.model.id !== newModelIdValue && !(feature.model.isDefault && newModelIdValue === "default")) ||
                currentlyUsingDefault !== wantToUseDefault

            if (needsUpdate) {
                console.log(
                    `Will update feature ${feature.name} (${feature.id}): Current=${feature.model.id} (isDefault=${currentlyUsingDefault}), New=${newModelIdValue}`
                )
                try {
                    await updateFeatureModel(feature.id, modelToSet)
                } catch (error) {
                    console.error(`Failed to update model for ${feature.name}:`, error)
                    // Error toast is already shown in the hook
                }
            }
        })

        // Wait for all updates to complete
        await Promise.all(modelUpdatePromises)

        // Navigate back
        pop()
    }

    // Helper function to generate variable info text
    const getVariableInfoText = (allowedVariables?: string[]) => {
        if (!allowedVariables || allowedVariables.length === 0) {
            return "No template variables available for this prompt."
        }

        return `Available variables: ${allowedVariables.map(v => `{{ ${v} }}`).join(", ")}`
    }

    // Render loading state while data is loading
    const isLoading = isLoadingPrompts || isLoadingFeatures || isLoadingModels
    if (isLoading && (prompts.length === 0 || features.length === 0)) {
        console.log("Rendering loading state")
        return (
            <Form isLoading={true}>
                <Form.Description title="Settings" text="Loading settings..." />
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

            <Form.Separator />

            <Form.Description
                title="AI Model Preferences"
                text="Select which AI model to use for each feature. Models are grouped by provider. Each feature has a system default that will be used unless you override it."
            />

            {features.map(feature => {
                // Get if this feature is currently updating
                const isUpdating = isUpdatingFeature(feature.id)

                return (
                    <Form.Dropdown
                        key={feature.id}
                        id={`model_${feature.id}`}
                        title={feature.name}
                        defaultValue={feature.model.isDefault ? "default" : feature.model.id}
                        isLoading={isUpdating}
                        info={feature.description}
                    >
                        <Form.Dropdown.Item
                            key="default"
                            value="default"
                            title="System Default"
                            icon={feature.model.isDefault ? Icon.CheckCircle : Icon.Circle}
                        />

                        {/* Group models by provider */}
                        {Object.entries(modelsByProvider).map(([providerId, providerModels]) => {
                            // Find the provider name from the first model
                            const providerName = providerModels[0]?.provider.name || providerId

                            return (
                                <Form.Dropdown.Section key={providerId} title={providerName}>
                                    {providerModels.map(model => (
                                        <Form.Dropdown.Item
                                            key={model.id}
                                            value={model.id}
                                            title={model.name}
                                            icon={
                                                !feature.model.isDefault && feature.model.id === model.id
                                                    ? Icon.CheckCircle
                                                    : Icon.Circle
                                            }
                                        />
                                    ))}
                                </Form.Dropdown.Section>
                            )
                        })}
                    </Form.Dropdown>
                )
            })}
        </Form>
    )
}
