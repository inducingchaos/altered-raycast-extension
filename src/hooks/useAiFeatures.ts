import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"

const DEV_BASE_URL = "http://localhost:5873"

export interface AiFeature {
    id: string
    description: string
    model: {
        id: string
        isDefault: boolean
    }
}

// Get the API key from preferences
const getAuthHeader = () => {
    const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()
    return {
        Authorization: `Bearer ${apiKey}`
    }
}

export function useAiFeatures() {
    const [updatingFeatures, setUpdatingFeatures] = useState<Set<string>>(new Set())

    const {
        isLoading,
        data: features = [],
        mutate: revalidateFeatures
    } = useFetch<AiFeature[]>(`${DEV_BASE_URL}/api/ai/features`, {
        headers: {
            ...getAuthHeader()
        },
        onError: error => {
            console.error("Error fetching AI features:", error)
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to load AI features",
                message: error instanceof Error ? error.message : String(error)
            })
        }
    })

    const updateFeatureModel = async (featureId: string, modelId: string | null) => {
        // Mark feature as updating
        setUpdatingFeatures(prev => {
            const newSet = new Set(prev)
            newSet.add(featureId)
            return newSet
        })

        console.log(`Updating feature ${featureId} model to ${modelId === null ? "system default" : modelId}`)

        const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Updating feature model",
            message: `Setting ${featureId} model to ${modelId === null ? "system default" : modelId}...`
        })

        try {
            // Make the API request
            const response = await fetch(`${DEV_BASE_URL}/api/ai/features/${featureId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader()
                },
                body: JSON.stringify({ modelId })
            })

            // Check for errors
            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unknown error")
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
            }

            // Update was successful
            await revalidateFeatures()

            toast.style = Toast.Style.Success
            toast.title = "Model updated"
            toast.message = `Successfully updated model for ${featureId}`
        } catch (error) {
            console.error(`Error updating model for feature ${featureId}:`, error)

            toast.style = Toast.Style.Failure
            toast.title = "Failed to update model"
            toast.message = error instanceof Error ? error.message : String(error)
        } finally {
            // Clear updating status
            setUpdatingFeatures(prev => {
                const newSet = new Set(prev)
                newSet.delete(featureId)
                return newSet
            })
        }
    }

    return {
        isLoading,
        features,
        isUpdatingFeature: (featureId: string) => updatingFeatures.has(featureId),
        updateFeatureModel
    }
}
