import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState, useCallback } from "react"

const DEV_BASE_URL = "http://localhost:5873"

export interface ToolsPreferences {
    autoGenerateAliases: boolean
}

// Get the API key from preferences
const getAuthHeader = () => {
    const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()
    return {
        Authorization: `Bearer ${apiKey}`
    }
}

// Parse string value to boolean
const parseStringToBoolean = (value?: string, defaultValue = false): boolean => {
    if (value === "true") return true
    if (value === "false") return false

    if (value === undefined) return defaultValue

    throw new Error(`Cannot interpret "${value}" as a boolean value`)
}

export function useToolsPreferences() {
    const [isUpdating, setIsUpdating] = useState(false)

    // figure out why has 1 stale open when other settings categories don't (just change the db between cached runs)

    const {
        isLoading,
        data: kvData,
        mutate: revalidatePreferences
    } = useFetch<{ key: string; value: string }>(`${DEV_BASE_URL}/api/preferences/kv/auto-generate-aliases`, {
        headers: {
            ...getAuthHeader()
        },
        keepPreviousData: true,
        // Custom response parser to handle 404s gracefully
        async parseResponse(response) {
            if (response.status === 404) {
                console.log("KV key 'auto-generate-aliases' not found, using default value")
                return { key: "auto-generate-aliases", value: "false" }
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unknown error")
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
            }

            return response.json()
        },
        onError: error => {
            // This will now only be called for non-404 errors
            console.error("Error fetching tools preferences:", error)
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to load tools preferences",
                message: error instanceof Error ? error.message : String(error)
            })
        }
    })

    // Convert KV data to preferences object
    const preferences: ToolsPreferences = {
        autoGenerateAliases: parseStringToBoolean(kvData?.value)
    }

    const updateToolsPreferences = useCallback(
        async (updatedPreferences: Partial<ToolsPreferences>) => {
            if (isUpdating) return

            if (updatedPreferences.autoGenerateAliases === undefined) return

            setIsUpdating(true)

            const toast = await showToast({
                style: Toast.Style.Animated,
                title: "Updating tools preferences",
                message: "Saving your changes..."
            })

            try {
                // Update with optimistic response
                await revalidatePreferences(
                    // Create and execute the fetch
                    (async () => {
                        const response = await fetch(`${DEV_BASE_URL}/api/preferences/kv/auto-generate-aliases`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                ...getAuthHeader()
                            },
                            body: JSON.stringify(String(updatedPreferences.autoGenerateAliases))
                        })

                        if (!response.ok) {
                            const errorText = await response.text().catch(() => "Unknown error")
                            console.error(`Response error body: ${errorText}`)
                            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
                        }

                        const data = await response.json()
                        return data
                    })(),
                    {
                        // Optimistically update the UI
                        optimisticUpdate() {
                            return {
                                key: "auto-generate-aliases",
                                value: String(updatedPreferences.autoGenerateAliases)
                            }
                        }
                    }
                )

                // Request succeeded
                toast.style = Toast.Style.Success
                toast.title = "Preferences updated"
                toast.message = "Auto-generate aliases setting saved successfully"
            } catch (error) {
                console.error("Error updating tools preferences:", error)

                // Show error toast
                toast.style = Toast.Style.Failure
                toast.title = "Failed to update preferences"
                toast.message = error instanceof Error ? error.message : String(error)
            } finally {
                setIsUpdating(false)
            }
        },
        [isUpdating, revalidatePreferences]
    )

    return {
        isLoading,
        isUpdating,
        preferences,
        updateToolsPreferences
    }
}
