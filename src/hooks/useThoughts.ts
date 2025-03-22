import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"
import { Thought, ThoughtFormFields } from "../types/thought"
import { FRONTEND_HIDDEN_FIELDS, TEMP_PREFIXED_FIELDS } from "../utils/thought"

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
                    const thoughts = data as Thought[]
                    return thoughts.filter(t => !thoughtIds.includes(t.id.toString()))
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
        // Convert any input to string for consistent checking
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
                    const thoughts = data as Thought[]
                    return thoughts.map(t => {
                        if (t.id === thought.id) {
                            return {
                                ...t,
                                validated: newValidationStatus
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
            // Create a promise for all API calls
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
                    const thoughts = data as Thought[]
                    return thoughts.map(t => {
                        if (thoughtIds.includes(t.id.toString())) {
                            return {
                                ...t,
                                validated: targetValidationState
                            }
                        }
                        return t
                    })
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
                    apiFields[`TEMP_${key}`] = value
                } else {
                    // Send content and other non-TEMP fields directly
                    apiFields[key] = value
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

    // Function to validate all visible thoughts
    const validateAllThoughts = async () => {
        try {
            // Filter thoughts that are not already validated
            const thoughtsToValidate = thoughts?.filter(thought => thought.validated !== "true") || []

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
        thoughts,
        isLoading,
        isOptimistic,
        handleDeleteThought,
        toggleThoughtValidation,
        toggleMassThoughtValidation,
        handleEditThought,
        validateAllThoughts,
        massThoughtDeletion
    }
}
