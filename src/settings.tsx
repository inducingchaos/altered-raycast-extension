import { Action, ActionPanel, Form, Icon, Toast, showToast, useNavigation } from "@raycast/api"
import { useState, useMemo, useEffect } from "react"
import { usePrompts } from "./hooks/usePrompts"
import { useAiFeatures } from "./hooks/useAiFeatures"
import { useAiModels, AiModel } from "./hooks/useAiModels"

export default function Settings() {
    // console.log("Settings component rendering")

    const { pop } = useNavigation()

    // Get prompts data
    const { prompts, isLoading: isLoadingPrompts, updatePrompts } = usePrompts()
    // console.log("From hook - prompts:", prompts.length, "isLoading:", isLoadingPrompts)

    // Get AI features and models
    const { features, isUpdatingFeature, updateFeatureModel } = useAiFeatures()
    const { models } = useAiModels()

    // Use form key to force re-render when needed
    const [formKey, setFormKey] = useState(0)

    // Store only edited values to prevent flickering
    const [editedPromptValues, setEditedPromptValues] = useState<Record<string, string>>({})

    // Add debug logging
    useEffect(() => {
        // console.log("Debug rendering state:", {
        //     promptsLength: prompts.length,
        //     isLoadingPrompts,
        //     featuresLength: features.length,
        //     editedValuesCount: Object.keys(editedPromptValues).length
        // })
    }, [prompts, isLoadingPrompts, features, editedPromptValues])

    // Handle form value changes - only store values that are different from the original
    const handlePromptValueChange = (id: string, value: string) => {
        const prompt = prompts.find(p => p.id === id)
        if (!prompt) return

        // If value matches the original, remove it from edited values
        if (value === prompt.content) {
            setEditedPromptValues(prev => {
                const newValues = { ...prev }
                delete newValues[id]
                return newValues
            })
        } else {
            // Otherwise store the edited value
            setEditedPromptValues(prev => ({
                ...prev,
                [id]: value
            }))
        }
    }

    // Get the current value for a prompt (edited value or original)
    const getPromptValue = (promptId: string) => {
        const prompt = prompts.find(p => p.id === promptId)
        // If there's an edited value, use that; otherwise use the original
        return promptId in editedPromptValues ? editedPromptValues[promptId] : prompt?.content || ""
    }

    // Group models by provider
    const modelsByProvider = useMemo(() => {
        const grouped: Record<string, AiModel[]> = {}

        models.forEach(model => {
            // Use the provider name from the model object
            const providerName = model.provider?.name || "Unknown"
            if (!grouped[providerName]) {
                grouped[providerName] = []
            }
            grouped[providerName].push(model)
        })

        return grouped
    }, [models])

    // Handle form submission
    const handleSubmit = async (formValues: { [key: string]: string }) => {
        // console.log("Form submitted!", formValues)

        const toastId = await showToast({
            style: Toast.Style.Animated,
            title: "Saving settings..."
        })

        try {
            // Track success counts for user feedback
            let modelUpdateCount = 0
            let promptUpdateCount = 0

            // Process model changes
            for (const feature of features) {
                const formKey = `model_${feature.id}`
                const newModelIdValue = formValues[formKey]

                // If undefined, this field wasn't in the form
                if (newModelIdValue === undefined) continue

                // Determine what model ID to set (null for default, specific ID otherwise)
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
                    // console.log(
                    //     `Will update feature ${feature.name} (${feature.id}): Current=${feature.model.id} (isDefault=${currentlyUsingDefault}), New=${newModelIdValue}`
                    // )
                    try {
                        await updateFeatureModel(feature.id, modelToSet)
                        modelUpdateCount++
                    } catch (error) {
                        console.error(`Failed to update model for ${feature.name}:`, error)
                        // Error toast is already shown in the hook
                    }
                }
            }

            // Handle prompt updates - only send prompts that were edited
            const updatedPrompts = prompts
                .filter(prompt => prompt.id in editedPromptValues && editedPromptValues[prompt.id] !== prompt.content)
                .map(prompt => ({
                    id: prompt.id,
                    content: editedPromptValues[prompt.id] || "",
                    name: prompt.name
                }))

            // console.log("Prompts to update:", updatedPrompts.length)

            if (updatedPrompts.length > 0) {
                await updatePrompts(updatedPrompts)
                promptUpdateCount = updatedPrompts.length
            }

            // Success toast with summary
            const totalUpdates = modelUpdateCount + promptUpdateCount
            if (totalUpdates > 0) {
                toastId.style = Toast.Style.Success
                toastId.title = "Settings saved"
                toastId.message = `Updated ${totalUpdates} ${totalUpdates === 1 ? "setting" : "settings"}`
            } else {
                toastId.style = Toast.Style.Success
                toastId.title = "No changes needed"
                toastId.message = "Your settings are already up to date"
            }

            // Reset edited values
            setEditedPromptValues({})

            // Force re-render to reset form state with fresh values from the server
            setFormKey(prev => prev + 1)

            // Navigate back to the previous screen
            pop()
        } catch (error) {
            console.error("Error saving settings:", error)

            toastId.style = Toast.Style.Failure
            toastId.title = "Failed to save settings"
            toastId.message = error instanceof Error ? error.message : String(error)
        }
    }

    // Prepare the form with both prompts and AI Models sections
    return (
        <Form
            key={formKey}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Save Settings" icon={Icon.Check} onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.Description
                title="Prompt Templates"
                text="Customize the system prompts used for various features. Use variables in double curly braces: {{variable}}. Changes will apply immediately after saving."
            />

            {/* Always render prompts - even when loading */}
            {prompts.map(prompt => (
                <Form.TextArea
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.name}
                    placeholder="Enter prompt template..."
                    value={getPromptValue(prompt.id)}
                    onChange={value => handlePromptValueChange(prompt.id, value)}
                    info={
                        prompt.allowedVariables?.length > 0
                            ? `Variables: ${prompt.allowedVariables.join(", ")}`
                            : "No variables available for this prompt"
                    }
                />
            ))}

            {/* Show loading message only when no prompts are available yet */}
            {isLoadingPrompts && prompts.length === 0 && <Form.Description text="Loading prompts..." />}

            <Form.Separator />

            <Form.Description
                title="AI Models"
                text="Choose which AI models to use for different features. Each feature has a system default, or you can select a specific model for your needs. Changes will apply immediately after saving."
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

                        {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
                            <Form.Dropdown.Section key={provider} title={provider}>
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
                        ))}
                    </Form.Dropdown>
                )
            })}
        </Form>
    )
}
