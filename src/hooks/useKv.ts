import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState, useCallback } from "react"

const DEV_BASE_URL = "http://localhost:5873"

// Get the API key from preferences
const getAuthHeader = () => {
    const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()
    return {
        Authorization: `Bearer ${apiKey}`
    }
}

// Parse string value to boolean
export const parseStringToBoolean = (value: string | undefined, defaultValue = false): boolean => {
    if (value === "true") return true
    if (value === "false") return false

    if (value === undefined) return defaultValue

    throw new Error(`Cannot interpret "${value}" as a boolean value`)
}

// Helper for safely parsing JSON values
export const parseStringToJSON = <T>(value: string | undefined, defaultValue: T): T => {
    if (!value) return defaultValue
    try {
        return JSON.parse(value) as T
    } catch (error) {
        console.error(`Error parsing JSON value: ${value}`, error)
        return defaultValue
    }
}

// Hook for working with key-value pairs
export function useKv<T>(
    key: string,
    defaultValue: T,
    parseValue: (value: string | undefined, defaultValue: T) => T = parseStringToJSON
) {
    const [isUpdating, setIsUpdating] = useState(false)

    const {
        isLoading,
        data: kvData,
        mutate: revalidateKv
    } = useFetch<{ key: string; value: string }>(`${DEV_BASE_URL}/api/preferences/kv/${key}`, {
        headers: {
            ...getAuthHeader()
        },
        keepPreviousData: true,
        // Custom response parser to handle 404s gracefully
        async parseResponse(response) {
            if (response.status === 404) {
                console.log(`KV key '${key}' not found, using default value`)
                return { key, value: JSON.stringify(defaultValue) }
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => "Unknown error")
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
            }

            return response.json()
        },
        onError: error => {
            // This will now only be called for non-404 errors
            console.error(`Error fetching KV for ${key}:`, error)
            showToast({
                style: Toast.Style.Failure,
                title: `Failed to load preference: ${key}`,
                message: error instanceof Error ? error.message : String(error)
            })
        }
    })

    // Parse the KV data
    const value = parseValue(kvData?.value, defaultValue)

    const updateValue = useCallback(
        async (newValue: T) => {
            if (isUpdating) return

            setIsUpdating(true)

            const toast = await showToast({
                style: Toast.Style.Animated,
                title: "Updating preference",
                message: `Saving ${key}...`
            })

            try {
                // Update with optimistic response
                await revalidateKv(
                    // Create and execute the fetch
                    (async () => {
                        const response = await fetch(`${DEV_BASE_URL}/api/preferences/kv/${key}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                ...getAuthHeader()
                            },
                            body: JSON.stringify(newValue)
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
                                key,
                                value: JSON.stringify(newValue)
                            }
                        }
                    }
                )

                // Request succeeded
                toast.style = Toast.Style.Success
                toast.title = "Preference updated"
                toast.message = `${key} setting saved successfully`
            } catch (error) {
                console.error(`Error updating KV for ${key}:`, error)

                // Show error toast
                toast.style = Toast.Style.Failure
                toast.title = "Failed to update preference"
                toast.message = error instanceof Error ? error.message : String(error)
            } finally {
                setIsUpdating(false)
            }
        },
        [isUpdating, revalidateKv, key]
    )

    return {
        isLoading,
        isUpdating,
        value,
        updateValue
    }
}

// Convenience hook for boolean KV values
export function useBooleanKv(key: string, defaultValue = false) {
    return useKv(key, defaultValue, parseStringToBoolean)
}
