import { LocalStorage, showToast, Toast, getPreferenceValues } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useCallback, useEffect, useState } from "react"
import { getModelDisplayName, ModelId, ModelType } from "./useModelPreferences"

const DEV_BASE_URL = "http://localhost:5873"

// Storage key for local storage
const getStorageKey = (modelType: ModelType) => `${modelType}-model`

// Default model if nothing is stored
const DEFAULT_MODEL: ModelId = "claude-3-7-sonnet"

interface ModelPreferenceResponse {
    modelId: ModelId
    success: boolean
}

// Get the API key from preferences
const getAuthHeader = () => {
    const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()
    return {
        Authorization: `Bearer ${apiKey}`
    }
}

export function useModelPreferencesFetch(modelType: ModelType = "alias-generation") {
    // Track if initial load from localStorage is complete
    const [isInitialized, setIsInitialized] = useState(false)
    // Track local model state that will be shown in UI
    const [localModel, setLocalModel] = useState<ModelId>(DEFAULT_MODEL)
    // Track if we've shown the initial load error
    const [initialLoadErrorShown, setInitialLoadErrorShown] = useState(false)

    // Load initial preference from localStorage
    useEffect(() => {
        async function loadStoredPreference() {
            try {
                const storedModel = await LocalStorage.getItem<ModelId>(getStorageKey(modelType))
                if (storedModel) {
                    setLocalModel(storedModel)
                }
                setIsInitialized(true)
            } catch (error) {
                console.error("Error loading stored model preference:", error)
                setIsInitialized(true)

                // Show toast for localStorage error
                showToast({
                    style: Toast.Style.Failure,
                    title: "Failed to load model preference from storage",
                    message: error instanceof Error ? error.message : String(error)
                })
            }
        }

        loadStoredPreference()
    }, [modelType])

    // Fetch current model preference from server
    const { isLoading: isLoadingFromServer, mutate } = useFetch<ModelPreferenceResponse>(
        `${DEV_BASE_URL}/api/preferences/models/${modelType}`,
        {
            headers: {
                ...getAuthHeader()
            },
            // Only execute fetch after initial localStorage load is complete
            execute: isInitialized,
            onData: data => {
                console.log("Server returned model preference:", data)
                // Update local model with server value and store in localStorage
                if (data?.modelId) {
                    setLocalModel(data.modelId)
                    LocalStorage.setItem(getStorageKey(modelType), data.modelId)
                }
            },
            onError: error => {
                console.error("Error fetching model preference:", error)

                // Only show the initial load error once to avoid spam
                if (!initialLoadErrorShown) {
                    showToast({
                        style: Toast.Style.Failure,
                        title: "Failed to load model preference from server",
                        message: error instanceof Error ? error.message : String(error)
                    })
                    setInitialLoadErrorShown(true)
                }
            }
        }
    )

    // Setter function for changing model preference
    const setModelPreference = useCallback(
        async (newModelId: ModelId) => {
            // Remember original model before updating
            const originalModel = localModel

            const toast = await showToast({
                style: Toast.Style.Animated,
                title: "Updating model preference",
                message: `Setting ${modelType} model to ${getModelDisplayName(newModelId)}...`
            })

            try {
                // Update with optimistic response - but handle the error manually
                // so we can perform custom rollback logic
                await mutate(
                    // Create and execute the fetch, but check response status manually
                    // to ensure the API call was successful
                    (async () => {
                        const response = await fetch(`${DEV_BASE_URL}/api/preferences/models/${modelType}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                ...getAuthHeader()
                            },
                            body: JSON.stringify({ modelId: newModelId })
                        })

                        // Check if response is OK, if not throw an error
                        if (!response.ok) {
                            const errorText = await response.text().catch(() => "Unknown error")
                            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
                        }

                        return response
                    })(),
                    {
                        // Optimistically update UI
                        optimisticUpdate() {
                            // Update local state only - we'll handle localStorage separately
                            setLocalModel(newModelId)
                            // Return optimistic data for useFetch
                            return { modelId: newModelId, success: true }
                        },
                        // Don't use automatic rollback - we'll handle it manually
                        rollbackOnError: false
                    }
                )

                // If we get here, the server request succeeded

                // Now update localStorage
                await LocalStorage.setItem(getStorageKey(modelType), newModelId)

                // Show success toast
                toast.style = Toast.Style.Success
                toast.title = "Model preference updated"
                toast.message = `${modelType} model set to ${getModelDisplayName(newModelId)}`
            } catch (error) {
                console.error("Error updating model preference:", error)

                // Manual rollback - revert the local state
                setLocalModel(originalModel)

                // Show error toast
                toast.style = Toast.Style.Failure
                toast.title = "Failed to update model preference"
                toast.message = error instanceof Error ? error.message : String(error)
            }
        },
        [mutate, modelType, localModel]
    )

    return {
        currentModel: localModel,
        isLoading: isLoadingFromServer && !isInitialized,
        setModel: setModelPreference
    }
}
