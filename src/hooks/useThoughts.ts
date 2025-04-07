import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState, useMemo } from "react"
import { Thought, ThoughtFormFields } from "../types/thought"
import { FRONTEND_HIDDEN_FIELDS, TEMP_PREFIXED_FIELDS } from "../utils/thought"
import { useBooleanKv } from "./useKv"

const DEV_BASE_URL = "http://localhost:5873"

interface ThoughtsResponse {
    thoughts: Thought[]
    position: "start" | "delta" | "end"
    total: number
}

// Add a discriminated union type for array items
type ThoughtArrayItem = { type: "metadata"; data: { total: number } } | { type: "thought"; data: Thought }

// Helper to transform thoughts array to our internal format
const transformToArrayItems = (thoughts: Thought[], total: number): ThoughtArrayItem[] => [
    { type: "metadata", data: { total } },
    ...thoughts.map(thought => ({ type: "thought" as const, data: thought }))
]

// Helper to extract thoughts and total from array items
const extractFromArrayItems = (data: ThoughtArrayItem[] | undefined) => {
    if (!data) return { thoughts: [], total: 0 }

    const metadataItem = data.find(item => item.type === "metadata") as
        | { type: "metadata"; data: { total: number } }
        | undefined
    const thoughts = data
        .filter((item): item is { type: "thought"; data: Thought } => item.type === "thought")
        .map(item => item.data)

    return {
        thoughts,
        total: metadataItem?.data.total ?? 0
    }
}

export const useThoughts = (searchText: string) => {
    const [isOptimistic, setIsOptimistic] = useState(false)
    const { value: askBeforeDelete } = useBooleanKv("ask-before-delete", true)

    const { isLoading, mutate, data, pagination } = useFetch(
        options => {
            const params = new URLSearchParams({ limit: "25", offset: (options.page * 25).toString() })
            if (searchText) params.append("search", searchText)
            return `${DEV_BASE_URL}/api/thoughts?${params}`
        },
        {
            headers: {
                Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
            },
            execute: !isOptimistic,
            mapResult: (result: ThoughtsResponse) => ({
                data: transformToArrayItems(result.thoughts, result.total),
                hasMore: result.position !== "end"
            })
        }
    )

    // Extract thoughts and total from the transformed data
    const processedData = useMemo(() => extractFromArrayItems(data), [data])

    // This function will be used by components to trigger a delete with confirmation
    const handleDeleteThought = async (thoughtId: string) => {
        // Implement the actual deletion logic (moved from below)
        await executeThoughtDeletion(thoughtId)
    }

    // The actual implementation of deletion, separated for clarity
    const executeThoughtDeletion = async (thoughtId: string) => {
        setIsOptimistic(true)
        const toast = await showToast({ style: Toast.Style.Animated, title: "Deleting thought..." })

        try {
            const deleteRequest = fetch(`${DEV_BASE_URL}/api/thoughts/${thoughtId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                }
            })

            await mutate(deleteRequest, {
                optimisticUpdate(data) {
                    if (!data) return data
                    const { thoughts, total } = extractFromArrayItems(data)
                    const updatedThoughts = thoughts.filter(t => t.id !== thoughtId)
                    return transformToArrayItems(updatedThoughts, total - 1)
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

    const massThoughtDeletion = async (thoughts: Thought[]) => {
        if (!thoughts.length) return

        setIsOptimistic(true)
        const thoughtIds = thoughts.map(t => t.id.toString())

        try {
            const bulkDeletePromise = Promise.all(
                thoughts.map(thought =>
                    fetch(`${DEV_BASE_URL}/api/thoughts/${thought.id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                        }
                    })
                )
            )

            const responses = await mutate(bulkDeletePromise, {
                optimisticUpdate(data) {
                    if (!data) return data
                    const { thoughts: currentThoughts, total } = extractFromArrayItems(data)
                    const remainingThoughts = currentThoughts.filter(t => !thoughtIds.includes(t.id.toString()))
                    return transformToArrayItems(remainingThoughts, total - thoughts.length)
                }
            })

            const failedResponses = responses.filter((response: Response) => !response.ok)
            if (failedResponses.length > 0) {
                throw new Error(`${failedResponses.length} deletion updates failed`)
            }
        } catch (error) {
            console.error("Error in mass deletion:", error)

            showToast({
                style: Toast.Style.Failure,
                title: "Failed to delete thoughts",
                message: error instanceof Error ? error.message : String(error)
            })

            mutate()
        }

        setIsOptimistic(false)
    }

    const toggleThoughtValidation = async (thought: Thought) => {
        setIsOptimistic(true)
        const isCurrentlyValidated = thought.validated === "true"
        const newValidationStatus = isCurrentlyValidated ? "false" : "true"

        try {
            const fetchRequest = fetch(`${DEV_BASE_URL}/api/thoughts/${thought.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                },
                body: JSON.stringify({ TEMP_validated: newValidationStatus })
            })

            const response = await mutate(fetchRequest, {
                optimisticUpdate(data) {
                    if (!data) return data
                    const { thoughts, total } = extractFromArrayItems(data)
                    const updatedThoughts = thoughts.map(t =>
                        t.id === thought.id ? { ...t, validated: newValidationStatus } : t
                    )
                    return transformToArrayItems(updatedThoughts, total)
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
                title: `Failed to ${newValidationStatus === "true" ? "validate" : "invalidate"} thought`,
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

    // Function to toggle validation for multiple thoughts at once
    const toggleMassThoughtValidation = async (thoughtsToUpdate: Thought[], targetValidationState: string) => {
        if (!thoughtsToUpdate.length) return

        setIsOptimistic(true)
        const thoughtIds = thoughtsToUpdate.map(t => t.id.toString())

        try {
            const bulkUpdatePromise = Promise.all(
                thoughtsToUpdate.map(thought =>
                    fetch(`${DEV_BASE_URL}/api/thoughts/${thought.id}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                        },
                        body: JSON.stringify({ TEMP_validated: targetValidationState })
                    })
                )
            )

            const responses = await mutate(bulkUpdatePromise, {
                optimisticUpdate(data) {
                    if (!data) return data
                    const { thoughts, total } = extractFromArrayItems(data)
                    const updatedThoughts = thoughts.map(t =>
                        thoughtIds.includes(t.id.toString()) ? { ...t, validated: targetValidationState } : t
                    )
                    return transformToArrayItems(updatedThoughts, total)
                }
            })

            // Check if any requests failed
            const failedResponses = responses.filter((response: Response) => !response.ok)
            if (failedResponses.length > 0) {
                throw new Error(`${failedResponses.length} validation updates failed`)
            }
        } catch (error) {
            console.error("Error in mass validation:", error)

            showToast({
                style: Toast.Style.Failure,
                title: `Failed to ${targetValidationState === "true" ? "validate" : "invalidate"} thoughts`,
                message: error instanceof Error ? error.message : String(error)
            })

            // Refresh data to ensure UI is consistent with server state
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
                if (FRONTEND_HIDDEN_FIELDS.includes(key)) {
                    return
                }

                // Add TEMP_ prefix for fields that require it
                if (TEMP_PREFIXED_FIELDS.includes(key)) {
                    apiFields[`TEMP_${key}`] = value as string | string[]
                } else {
                    // Send content and other non-TEMP fields directly
                    apiFields[key] = value as string | string[]
                }
            })

            // console.log("API Fields being sent:", apiFields)

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
                    if (!data) return data
                    const { thoughts, total } = extractFromArrayItems(data)
                    const updatedThoughts = thoughts.map(t => (t.id === thought.id ? { ...t, ...updatedFields } : t))
                    return transformToArrayItems(updatedThoughts, total)
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

    // Function to validate all visible thoughts
    const validateAllThoughts = async () => {
        try {
            // Filter thoughts that are not already validated
            const thoughtsToValidate = processedData.thoughts.filter(thought => thought.validated !== "true")

            if (thoughtsToValidate.length === 0) {
                showToast({
                    style: Toast.Style.Success,
                    title: "Nothing to validate",
                    message: "All thoughts are already validated"
                })
                return
            }

            // Show progress toast
            const toast = await showToast({
                style: Toast.Style.Animated,
                title: "Validating thoughts",
                message: `Validating ${thoughtsToValidate.length} thoughts...`
            })

            // Use toggleMassThoughtValidation for batch update
            await toggleMassThoughtValidation(thoughtsToValidate, "true")
                .then(() => {
                    toast.style = Toast.Style.Success
                    toast.title = "All thoughts validated"
                    toast.message = `Successfully validated ${thoughtsToValidate.length} thoughts`
                })
                .catch(error => {
                    toast.style = Toast.Style.Failure
                    toast.title = "Validation partially failed"
                    toast.message = error instanceof Error ? error.message : String(error)
                })
        } catch (error) {
            console.error("Error validating all thoughts:", error)
            showToast({
                style: Toast.Style.Failure,
                title: "Error",
                message: "Failed to validate thoughts"
            })
        }
    }

    return {
        thoughts: processedData.thoughts,
        total: processedData.total,
        isLoading,
        isOptimistic,
        handleDeleteThought,
        executeThoughtDeletion,
        askBeforeDelete,
        toggleThoughtValidation,
        toggleMassThoughtValidation,
        handleEditThought,
        validateAllThoughts,
        massThoughtDeletion,
        pagination
    }
}
