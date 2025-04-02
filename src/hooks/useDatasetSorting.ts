import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { Thought } from "../types/thought"

interface DatasetSorting {
    thoughtIds: string[]
    updatedAt: string
}

const DEV_BASE_URL = "http://localhost:5873"

export function useDatasetSorting(datasetId: string | undefined) {
    const { data, isLoading, mutate } = useFetch<DatasetSorting>(
        datasetId ? `${DEV_BASE_URL}/api/datasets/${datasetId}/sorting` : "",
        {
            headers: {
                Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
            },
            execute: !!datasetId,
            // Don't show errors for 404s - this is expected when no sorting exists yet
            onError: error => {
                if (error.message !== "Not Found") {
                    showToast({
                        style: Toast.Style.Failure,
                        title: "Failed to fetch thought order",
                        message: error.message
                    })
                }
            }
        }
    )

    const updateSorting = async (thoughtIds: string[]) => {
        if (!datasetId) return

        try {
            // First, optimistically update the local state
            await mutate(
                // This is a promise that will eventually resolve with the API response
                (async () => {
                    const response = await fetch(`${DEV_BASE_URL}/api/datasets/${datasetId}/sorting`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                        },
                        body: JSON.stringify({ thoughtIds })
                    })

                    if (!response.ok) {
                        throw new Error(`Failed to update sorting: ${response.statusText}`)
                    }

                    return response.json()
                })(),
                {
                    // Immediately update the UI with the new order
                    optimisticUpdate: (currentData: DatasetSorting | undefined) => ({
                        ...currentData,
                        thoughtIds,
                        updatedAt: new Date().toISOString()
                    })
                }
            )
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to update thought order",
                message: error instanceof Error ? error.message : "Unknown error"
            })
            throw error
        }
    }

    const getSortedThoughts = (thoughts: Thought[] | undefined): Thought[] | undefined => {
        if (!thoughts) return thoughts
        if (!data?.thoughtIds) {
            // If no sorting data, sort by updatedAt
            return [...(thoughts || [])].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        }

        // Create a map for O(1) lookups
        const thoughtMap = new Map(thoughts.map(t => [t.id, t]))

        // Filter out any IDs that don't exist in current thoughts and preserve order
        const validSortIds = data.thoughtIds.filter((id: string) => thoughtMap.has(id))

        // Get thoughts not in sort order
        const unsortedThoughts = thoughts.filter(t => !validSortIds.includes(t.id))

        // Combine sorted + unsorted (fallback to updatedAt)
        return [
            ...validSortIds.map((id: string) => thoughtMap.get(id)!),
            ...unsortedThoughts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        ]
    }

    return {
        isLoading,
        updateSorting,
        getSortedThoughts
    }
}
