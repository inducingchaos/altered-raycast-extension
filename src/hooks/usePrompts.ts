import { useCallback, useEffect, useState } from "react"
import { showToast, Toast } from "@raycast/api"
import { fetchPrompts, updatePrompt, Prompt } from "../utils/api"

export function usePrompts() {
    console.log("usePrompts hook initialized/rendered")
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Fetch all prompts
    const fetchAllPrompts = useCallback(async () => {
        console.log("fetchAllPrompts called, current isLoading:", isLoading)
        if (!isLoading) setIsLoading(true)
        setError(null)

        try {
            console.log("Fetching prompts from API...")
            const fetchedPrompts = await fetchPrompts()
            console.log("Received prompts:", fetchedPrompts.length)
            setPrompts(fetchedPrompts)
        } catch (err) {
            console.error("Error fetching prompts", err)
            const error = err instanceof Error ? err : new Error(String(err))
            setError(error)

            showToast({
                style: Toast.Style.Failure,
                title: "Failed to fetch prompts",
                message: error.message
            })
        } finally {
            console.log("Setting isLoading to false")
            setIsLoading(false)
        }
    }, [])

    // Update all prompts in batch, with optimistic updates to prevent UI flicker
    const updatePrompts = useCallback(async (updatedPrompts: { id: string; content: string; name?: string }[]) => {
        console.log("updatePrompts called with prompts:", updatedPrompts.length)
        try {
            const toast = await showToast({
                style: Toast.Style.Animated,
                title: "Updating prompts..."
            })

            // Apply optimistic updates
            console.log("Applying optimistic updates")
            setPrompts(currentPrompts => {
                console.log("Current prompts before update:", currentPrompts.length)
                return currentPrompts.map(prompt => {
                    const updated = updatedPrompts.find(p => p.id === prompt.promptId)
                    if (updated) {
                        console.log("Updating prompt:", prompt.promptId)
                        return {
                            ...prompt,
                            content: updated.content,
                            ...(updated.name && { name: updated.name })
                        }
                    }
                    return prompt
                })
            })

            // Create an array of update promises
            console.log("Creating update promises")
            const updatePromises = updatedPrompts.map(({ id, content, name }) => updatePrompt(id, content, name))

            // Execute all updates in parallel
            console.log("Executing updates in parallel")
            await Promise.all(updatePromises)
            console.log("All updates completed successfully")

            toast.style = Toast.Style.Success
            toast.title = "Prompts updated successfully"
        } catch (error) {
            console.error("Error updating prompts", error)

            // Revert to original data on error
            console.log("Error occurred, reverting to original data")
            fetchAllPrompts()

            await showToast({
                style: Toast.Style.Failure,
                title: "Failed to update prompts",
                message: error instanceof Error ? error.message : String(error)
            })
        }
    }, [])

    // Fetch prompts on mount
    useEffect(() => {
        console.log("Initial useEffect running, fetching prompts")
        fetchAllPrompts()
    }, [fetchAllPrompts])

    return {
        prompts,
        isLoading,
        error,
        fetchPrompts: fetchAllPrompts,
        updatePrompts
    }
}
