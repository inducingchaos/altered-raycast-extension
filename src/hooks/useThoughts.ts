import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"
import { Thought, ThoughtFormFields } from "../types/thought"

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
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                throw new Error(errorData.message || `Failed with status ${response.status}`)
            }
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: `Failed to ${newValidation ? "validate" : "invalidate"} thought`,
                message: error instanceof Error ? error.message : String(error)
            })
            mutate()
        }

        setIsOptimistic(false)
    }

    const handleEditThought = async (thought: Thought, updatedFields: ThoughtFormFields) => {
        setIsOptimistic(true)

        try {
            const apiFields: Record<string, string | boolean> = {}
            Object.entries(updatedFields).forEach(([key, value]) => {
                if (key !== "id" && key !== "createdAt" && key !== "updatedAt" && key !== "attachmentId") {
                    apiFields[`TEMP_${key}`] = value
                }
            })

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
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                throw new Error(errorData.message || `Failed with status ${response.status}`)
            }
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to update thought",
                message: error instanceof Error ? error.message : String(error)
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
