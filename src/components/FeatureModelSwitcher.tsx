import { ActionPanel, Action, Icon } from "@raycast/api"
import { useMemo } from "react"
import { useAiFeatures } from "../hooks/useAiFeatures"
import { useAiModels } from "../hooks/useAiModels"

// Custom icon mapping for different features
const getFeatureIcon = (featureId: string) => {
    switch (featureId) {
        case "alias-generation":
            return Icon.TextSelection // Tag for alias generation
        case "thought-generation":
            return Icon.LightBulb // Chat bubble icon
        case "spell-checking":
            return Icon.Text
        default:
            return Icon.QuestionMark
    }
}

export function FeatureModelSwitcher() {
    const { features, isUpdatingFeature, updateFeatureModel } = useAiFeatures()
    const { models, isLoading: isLoadingModels } = useAiModels()

    // Group models by provider for better organization
    const modelsByProvider = useMemo(() => {
        const grouped: Record<string, typeof models> = {}

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

    // If no features or models, don't render anything
    if (!features.length || !models.length) return null

    // Determine if any feature is updating
    const isAnyFeatureUpdating = features.some(f => isUpdatingFeature(f.id))

    return (
        <ActionPanel.Submenu
            title="Configure Features"
            icon={Icon.Gear}
            shortcut={{ modifiers: ["cmd", "shift"], key: "m" }}
            isLoading={isLoadingModels || isAnyFeatureUpdating}
        >
            {features.map(feature => (
                <ActionPanel.Submenu
                    key={feature.id}
                    title={feature.name}
                    icon={getFeatureIcon(feature.id)}
                    isLoading={isUpdatingFeature(feature.id)}
                >
                    <ActionPanel.Submenu title="AI Model" icon={Icon.Stars}>
                        {/* <ActionPanel.Section title="Options"> */}
                        <Action
                            title="Default"
                            icon={feature.model.isDefault ? Icon.CheckCircle : Icon.Circle}
                            onAction={() => updateFeatureModel(feature.id, null)}
                        />
                        {/* </ActionPanel.Section> */}

                        {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
                            <ActionPanel.Section key={provider} title={provider}>
                                {providerModels.map(model => (
                                    <Action
                                        key={model.id}
                                        title={model.name}
                                        icon={
                                            !feature.model.isDefault && feature.model.id === model.id
                                                ? Icon.CheckCircle
                                                : Icon.Circle
                                        }
                                        onAction={() => updateFeatureModel(feature.id, model.id)}
                                        autoFocus={feature.model.id === model.id}
                                    />
                                ))}
                            </ActionPanel.Section>
                        ))}
                    </ActionPanel.Submenu>
                </ActionPanel.Submenu>
            ))}
        </ActionPanel.Submenu>
    )
}
