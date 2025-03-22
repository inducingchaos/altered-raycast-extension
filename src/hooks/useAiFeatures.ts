import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"

const DEV_BASE_URL = "http://localhost:5873"

export interface AiFeature {
    id: string
    name: string
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

        // Get the feature to access its name
        const feature = features.find(f => f.id === featureId)
        const featureName = feature?.name || featureId

        console.log(`Updating feature ${featureName} model to ${modelId === null ? "system default" : modelId}`)

        const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Updating feature model",
            message: `Setting ${featureName} model to ${modelId === null ? "system default" : modelId}...`
        })

        try {
            // Make the API request
            console.log(`Making API request to ${DEV_BASE_URL}/api/ai/features/${featureId}`)
            console.log(`Request body:`, JSON.stringify({ modelId }))

            const response = await fetch(`${DEV_BASE_URL}/api/ai/features/${featureId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader()
                },
                body: JSON.stringify({ modelId })
            })

            // Log response details
            console.log(`Response status: ${response.status} ${response.statusText}`)

            // Check for errors
            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unknown error")
                console.error(`Response error body: ${errorText}`)
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
            }

            // Try to parse response
            try {
                const responseData = await response.json()
                console.log(`Response data:`, responseData)

                // Update the features array with the new data to reflect changes immediately
                // without waiting for revalidation
                features.forEach((feat, index) => {
                    if (feat.id === featureId) {
                        features[index] = responseData
                    }
                })
            } catch (e) {
                console.log(`Couldn't parse response JSON:`, e)
            }

            // Update was successful
            await revalidateFeatures()

            toast.style = Toast.Style.Success
            toast.title = "Model updated"
            toast.message = `Successfully updated model for ${featureName}`
        } catch (error) {
            console.error(`Error updating model for feature ${featureName}:`, error)

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
