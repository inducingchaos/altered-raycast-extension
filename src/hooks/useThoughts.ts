import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"
import { Thought, ThoughtFormFields } from "../types/thought"
import { EXCLUDED_API_FIELDS, TEMP_PREFIXED_FIELDS } from "../utils/thought"

const DEV_BASE_URL = "http://localhost:5873"

export const useThoughts = (searchText: string) => {
    const [isOptimistic, setIsOptimistic] = useState(false)

    const {
        isLoading,
        mutate,
        data: thoughts
    } = useFetch<Thought[]>(`https://altered.app/api/thoughts?${new URLSearchParams({ search: searchText })}`, {
        headers: {
            Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
        },
        execute: !isOptimistic
    })

    const handleDeleteThought = async (thoughtId: string) => {
        setIsOptimistic(true)
        const toast = await showToast({ style: Toast.Style.Animated, title: "Deleting thought..." })

        try {
            const deleteRequest = fetch(`https://altered.app/api/thoughts/${thoughtId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                }
            })

            await mutate(deleteRequest, {
                optimisticUpdate(data) {
                    const thoughts = data as Thought[]
                    return thoughts.filter(t => t.id !== thoughtId)
                }
            })

            toast.style = Toast.Style.Success
            toast.title = "Thought deleted"
        } catch (err) {
            toast.style = Toast.Style.Failure
            toast.title = "Failed to delete thought"
        }

        setIsOptimistic(false)
    }

    const toggleThoughtValidation = async (thought: Thought) => {
        setIsOptimistic(true)
        const currentValidation = thought.validated === "true" || thought.validated === true
        const newValidation = !currentValidation

        try {
            const fetchRequest = fetch(`${DEV_BASE_URL}/api/thoughts/${thought.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                },
                body: JSON.stringify({ TEMP_validated: newValidation ? "true" : "false" })
            })

            const response = await mutate(fetchRequest, {
                optimisticUpdate(data) {
                    const thoughts = data as Thought[]
                    return thoughts.map(t => {
                        if (t.id === thought.id) {
                            return {
                                ...t,
                                validated: newValidation ? "true" : "false"
                            }
                        }
                        return t
                    })
                }
            })

            if (!response.ok) {
                // Parse error response in detail
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                console.error("API Error Response:", errorData)

                // Extract detailed error information
                const errorMessage = errorData.message || `Failed with status ${response.status}`
                const errorDetails = errorData.error
                    ? typeof errorData.error === "string"
                        ? errorData.error
                        : JSON.stringify(errorData.error, null, 2)
                    : ""

                throw new Error(`${errorMessage}${errorDetails ? `\n\nDetails: ${errorDetails}` : ""}`)
            }
        } catch (error) {
            console.error("Error toggling validation:", error)

            showToast({
                style: Toast.Style.Failure,
                title: `Failed to ${newValidation ? "validate" : "invalidate"} thought`,
                message: error instanceof Error ? error.message : String(error),
                primaryAction: {
                    title: "View Details",
                    onAction: () => {
                        showToast({
                            style: Toast.Style.Failure,
                            title: "Error Details",
                            message: error instanceof Error ? error.message : String(error)
                        })
                    }
                }
            })

            mutate()
        }

        setIsOptimistic(false)
    }

    const handleEditThought = async (thought: Thought, updatedFields: ThoughtFormFields) => {
        setIsOptimistic(true)

        try {
            const apiFields: Record<string, string | string[]> = {}

            Object.entries(updatedFields).forEach(([key, value]) => {
                // Skip fields that should never be sent
                if (EXCLUDED_API_FIELDS.includes(key)) {
                    return
                }

                // Handle special case for validated - always send as string
                if (key === "validated") {
                    const validatedValue = value === true || value === "true" ? "true" : "false"

                    if (TEMP_PREFIXED_FIELDS.includes(key)) {
                        apiFields[`TEMP_${key}`] = validatedValue
                    } else {
                        apiFields[key] = validatedValue
                    }
                    return
                }

                // Add TEMP_ prefix for fields that require it
                if (TEMP_PREFIXED_FIELDS.includes(key)) {
                    if (Array.isArray(value)) {
                        apiFields[`TEMP_${key}`] = value
                    } else {
                        // Convert boolean to string if needed
                        apiFields[`TEMP_${key}`] = typeof value === "boolean" ? String(value) : value
                    }
                } else {
                    // Send content and other non-TEMP fields directly
                    if (Array.isArray(value)) {
                        apiFields[key] = value
                    } else {
                        // Convert boolean to string if needed
                        apiFields[key] = typeof value === "boolean" ? String(value) : value
                    }
                }
            })

            console.log("API Fields being sent:", apiFields)

            const fetchRequest = fetch(`${DEV_BASE_URL}/api/thoughts/${thought.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                },
                body: JSON.stringify(apiFields)
            })

            const response = await mutate(fetchRequest, {
                optimisticUpdate(data) {
                    const thoughts = data as Thought[]
                    return thoughts.map(t => {
                        if (t.id === thought.id) {
                            return {
                                ...t,
                                ...updatedFields
                            }
                        }
                        return t
                    })
                }
            })

            if (!response.ok) {
                // Parse error response in detail
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                console.error("API Error Response:", errorData)

                // Extract detailed error information
                const errorMessage = errorData.message || `Failed with status ${response.status}`
                const errorDetails = errorData.error
                    ? typeof errorData.error === "string"
                        ? errorData.error
                        : JSON.stringify(errorData.error, null, 2)
                    : ""

                throw new Error(`${errorMessage}${errorDetails ? `\n\nDetails: ${errorDetails}` : ""}`)
            }
        } catch (error) {
            console.error("Error updating thought:", error)

            showToast({
                style: Toast.Style.Failure,
                title: "Failed to update thought",
                message: error instanceof Error ? error.message : String(error),
                primaryAction: {
                    title: "View Details",
                    onAction: () => {
                        showToast({
                            style: Toast.Style.Failure,
                            title: "Error Details",
                            message: error instanceof Error ? error.message : String(error)
                        })
                    }
                }
            })

            mutate()
        }

        setIsOptimistic(false)
    }

    return {
        thoughts,
        isLoading,
        handleDeleteThought,
        toggleThoughtValidation,
        handleEditThought
    }
}
