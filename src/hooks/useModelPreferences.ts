import { useCallback, useState, useEffect } from "react"
import { showToast, Toast, LocalStorage } from "@raycast/api"
import { updateModelPreference } from "../utils/api"

export type ModelType = "alias-generation"
export type ModelId = "claude-3-7-sonnet" | "gpt-4o-mini"

// Default model selection if nothing in LocalStorage
const DEFAULT_MODEL: ModelId = "claude-3-7-sonnet"

// Create a constant for the storage key
const getStorageKey = (modelType: ModelType) => `${modelType}-model`

export function useModelPreferences() {
    const [currentModel, setCurrentModel] = useState<ModelId>(DEFAULT_MODEL)
    const [isUpdating, setIsUpdating] = useState(false)

    // Load stored preference from LocalStorage on mount
    useEffect(() => {
        async function loadStoredPreference() {
            try {
                const storedModel = await LocalStorage.getItem<ModelId>(getStorageKey("alias-generation"))
                if (storedModel) {
                    setCurrentModel(storedModel)
                }
            } catch (error) {
                console.error("Error loading stored model preference:", error)
            }
        }

        loadStoredPreference()
    }, [])

    const setModel = useCallback(async (modelType: ModelType, modelId: ModelId) => {
        setIsUpdating(true)

        try {
            // Show a loading toast
            const toast = await showToast({
                style: Toast.Style.Animated,
                title: "Updating model preference",
                message: `Setting ${modelType} model to ${getModelDisplayName(modelId)}...`
            })

            // Update local state
            setCurrentModel(modelId)

            // Store in LocalStorage
            await LocalStorage.setItem(getStorageKey(modelType), modelId)

            // Update preference on the server
            await updateModelPreference(modelType, modelId)

            // Show success toast
            toast.style = Toast.Style.Success
            toast.title = "Model preference updated"
            toast.message = `${modelType} model set to ${getModelDisplayName(modelId)}`

            // Set updating to false on success
            setIsUpdating(false)
        } catch (error) {
            console.error("Error updating model preference:", error)

            // Show error toast
            await showToast({
                style: Toast.Style.Failure,
                title: "Failed to update model preference",
                message: error instanceof Error ? error.message : String(error)
            })

            // Revert to the previous saved value or default
            try {
                const savedModel = (await LocalStorage.getItem<ModelId>(getStorageKey(modelType))) || DEFAULT_MODEL
                setCurrentModel(savedModel)
            } catch (e) {
                setCurrentModel(DEFAULT_MODEL)
            }

            // Set updating to false on error
            setIsUpdating(false)
        }
    }, [])

    return {
        currentModel,
        isUpdating,
        setModel
    }
}

// Helper function to get user-friendly model names
export function getModelDisplayName(modelId: ModelId): string {
    switch (modelId) {
        case "claude-3-7-sonnet":
            return "Claude 3.7 Sonnet"
        case "gpt-4o-mini":
            return "GPT-4o mini"
        default:
            return modelId
    }
}
