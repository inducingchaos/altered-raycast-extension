import { Action, ActionPanel, Icon } from "@raycast/api"
import { useModelPreferencesFetch } from "../hooks/useModelPreferencesFetch"
import { ModelId, ModelType } from "../hooks/useModelPreferences"
import { useState } from "react"

interface ModelSwitcherProps {
    modelType?: ModelType
}

export function ModelSwitcher({ modelType = "alias-generation" }: ModelSwitcherProps) {
    const { currentModel, isLoading, setModel } = useModelPreferencesFetch(modelType)

    // Track if we're currently in the process of changing a model
    const [isChangingModel, setIsChangingModel] = useState(false)

    // Wrapper function to track when we're actively changing models
    const handleModelChange = async (modelId: ModelId) => {
        setIsChangingModel(true)
        try {
            await setModel(modelId)
        } finally {
            setIsChangingModel(false)
        }
    }

    return (
        <ActionPanel.Submenu
            title="Change Alias Generation Model"
            icon={Icon.LightBulb}
            isLoading={isLoading || isChangingModel}
        >
            <Action
                title="Claude 3.7 Sonnet"
                icon={currentModel === "claude-3-7-sonnet" ? Icon.CheckCircle : Icon.Circle}
                onAction={() => handleModelChange("claude-3-7-sonnet")}
            />
            <Action
                // eslint-disable-next-line @raycast/prefer-title-case
                title="GPT-4o mini"
                icon={currentModel === "gpt-4o-mini" ? Icon.CheckCircle : Icon.Circle}
                onAction={() => handleModelChange("gpt-4o-mini")}
            />
        </ActionPanel.Submenu>
    )
}
