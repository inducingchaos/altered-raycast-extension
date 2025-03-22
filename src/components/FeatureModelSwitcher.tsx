import { ActionPanel, Action, Icon } from "@raycast/api"
import { useMemo } from "react"
import { useAiFeatures } from "../hooks/useAiFeatures"
import { useAiModels } from "../hooks/useAiModels"

interface FeatureModelSwitcherProps {
    featureId: string
}

export function FeatureModelSwitcher({ featureId }: FeatureModelSwitcherProps) {
    const { features, isUpdatingFeature, updateFeatureModel } = useAiFeatures()
    const { models } = useAiModels()

    // Find the feature we're working with
    const feature = useMemo(() => features.find(f => f.id === featureId), [features, featureId])

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

    // If feature not found, don't render anything
    if (!feature) return null

    // Get if this feature is currently updating
    const isUpdating = isUpdatingFeature(featureId)

    return (
        <ActionPanel.Submenu
            title={`Change Model for ${feature.name}`}
            icon={Icon.LightBulb}
            shortcut={{ modifiers: ["cmd", "shift"], key: "m" }}
            isLoading={isUpdating}
        >
            <Action
                title="System Default"
                icon={feature.model.isDefault ? Icon.CheckCircle : Icon.Circle}
                onAction={() => updateFeatureModel(featureId, null)}
            />

            {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
                <ActionPanel.Section key={provider} title={provider}>
                    {providerModels.map(model => (
                        <Action
                            key={model.id}
                            title={model.name}
                            icon={!feature.model.isDefault && feature.model.id === model.id ? Icon.CheckCircle : Icon.Circle}
                            onAction={() => updateFeatureModel(featureId, model.id)}
                        />
                    ))}
                </ActionPanel.Section>
            ))}
        </ActionPanel.Submenu>
    )
}
