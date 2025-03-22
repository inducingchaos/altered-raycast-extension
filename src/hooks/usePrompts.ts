import { useCallback, useState, useEffect } from "react"
import { showToast, Toast, getPreferenceValues } from "@raycast/api"
import { updatePrompt, Prompt } from "../utils/api"
import { useFetch } from "@raycast/utils"

const DEV_BASE_URL = "http://localhost:5873"

// Get the API key from preferences
const getAuthHeader = () => {
    const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()
    return {
        Authorization: `Bearer ${apiKey}`
    }
}

export function usePrompts() {
    console.log("usePrompts hook initialized/rendered")
    const [updatingPromptIds, setUpdatingPromptIds] = useState<Set<string>>(new Set())

    // Use useFetch for better caching behavior
    const {
        isLoading,
        data: prompts = [],
        mutate: revalidatePrompts
    } = useFetch<Prompt[]>(`${DEV_BASE_URL}/api/preferences/prompts`, {
        headers: {
            ...getAuthHeader()
        },
        keepPreviousData: true, // Keep previous data to prevent flickering
        onError: error => {
            console.error("Error fetching prompts:", error)
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to fetch prompts",
                message: error instanceof Error ? error.message : String(error)
            })
        }
    })

    // Add debug logging for prompts data
    useEffect(() => {
        console.log("Prompts data updated:", {
            count: prompts?.length || 0,
            isLoading
        })
    }, [prompts, isLoading])

    // Check if a specific prompt is currently being updated
    const isUpdatingPrompt = useCallback(
        (promptId: string) => {
            return updatingPromptIds.has(promptId)
        },
        [updatingPromptIds]
    )

    // Update all prompts in batch, with optimistic updates to prevent UI flicker
    const updatePrompts = useCallback(
        async (updatedPrompts: { id: string; content: string; name?: string }[]) => {
            console.log("updatePrompts called with prompts:", updatedPrompts.length)

            if (updatedPrompts.length === 0) return

            // Mark all prompts as updating
            setUpdatingPromptIds(prev => {
                const newSet = new Set(prev)
                updatedPrompts.forEach(p => newSet.add(p.id))
                return newSet
            })

            try {
                const toast = await showToast({
                    style: Toast.Style.Animated,
                    title: `Updating ${updatedPrompts.length} ${updatedPrompts.length === 1 ? "prompt" : "prompts"}...`
                })

                // Update with optimistic response
                await revalidatePrompts(
                    // Create and execute all update promises
                    (async () => {
                        try {
                            // Create an array of update promises
                            console.log("Creating update promises")
                            const updatePromises = updatedPrompts.map(async ({ id, content, name }) => {
                                try {
                                    const updatedPrompt = await updatePrompt(id, content, name)
                                    console.log(`Prompt ${id} updated successfully`)
                                    return updatedPrompt
                                } catch (err) {
                                    console.error(`Error updating prompt ${id}:`, err)
                                    throw err
                                } finally {
                                    // Clear updating state for this prompt
                                    setUpdatingPromptIds(prev => {
                                        const newSet = new Set(prev)
                                        newSet.delete(id)
                                        return newSet
                                    })
                                }
                            })

                            // Execute all updates in parallel
                            console.log("Executing updates in parallel")
                            const updatedPromptsResult = await Promise.all(updatePromises)
                            console.log("All updates completed successfully")

                            // Merge updated prompts with existing ones
                            const result = prompts.map(prompt => {
                                const updated = updatedPromptsResult.find(up => up.id === prompt.id)
                                return updated || prompt
                            })

                            return result
                        } catch (error) {
                            // Clear all updating states on error
                            setUpdatingPromptIds(new Set())
                            throw error
                        }
                    })(),
                    {
                        // Optimistically update the UI
                        optimisticUpdate(currentPrompts) {
                            if (!currentPrompts) return prompts

                            return currentPrompts.map(prompt => {
                                const updated = updatedPrompts.find(p => p.id === prompt.id)
                                if (updated) {
                                    return {
                                        ...prompt,
                                        content: updated.content,
                                        ...(updated.name && { name: updated.name })
                                    }
                                }
                                return prompt
                            })
                        }
                    }
                )

                // Success toast
                toast.style = Toast.Style.Success
                toast.title = updatedPrompts.length === 1 ? "Prompt updated successfully" : "Prompts updated successfully"
            } catch (error) {
                console.error("Error updating prompts", error)

                // Clear all updating states
                setUpdatingPromptIds(new Set())

                await showToast({
                    style: Toast.Style.Failure,
                    title: "Failed to update prompts",
                    message: error instanceof Error ? error.message : String(error)
                })
            }
        },
        [prompts, revalidatePrompts]
    )

    // Update a single prompt with optimistic updates
    const updateSinglePrompt = useCallback(
        async (id: string, content: string, name?: string) => {
            return updatePrompts([{ id, content, name }])
        },
        [updatePrompts]
    )

    return {
        prompts,
        isLoading,
        isUpdatingPrompt,
        updatePrompt: updateSinglePrompt,
        updatePrompts
    }
}
