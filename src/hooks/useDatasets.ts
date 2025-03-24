import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { nanoid } from "nanoid"
import { useState } from "react"
import { Dataset } from "../types/dataset"

const DEV_BASE_URL = "http://localhost:5873"

export const useDatasets = (searchText?: string) => {
    const [isOptimistic, setIsOptimistic] = useState(false)

    const {
        data: datasets,
        isLoading,
        mutate
    } = useFetch<Dataset[]>(
        `${DEV_BASE_URL}/api/datasets${searchText ? `?${new URLSearchParams({ search: searchText })}` : ""}`,
        {
            headers: {
                Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
            },
            execute: !isOptimistic
        }
    )

    const createDataset = async (title: string): Promise<{ title: string; id: string }> => {
        setIsOptimistic(true)
        const toast = await showToast({ style: Toast.Style.Animated, title: "Creating dataset..." })

        const id = nanoid()

        try {
            // console.log("Creating dataset with title:", title)

            const createRequest = fetch(`${DEV_BASE_URL}/api/datasets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                },
                body: JSON.stringify({ title, id })
            })

            const response = await mutate(createRequest, {
                optimisticUpdate(data) {
                    const newData = [
                        ...(data || []),
                        {
                            id,
                            title
                        }
                    ]

                    return newData
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

            toast.style = Toast.Style.Success
            toast.title = "Dataset created"
        } catch (error) {
            console.error("Error creating dataset:", error)

            toast.style = Toast.Style.Failure
            toast.title = "Failed to create dataset"
            toast.message = error instanceof Error ? error.message : String(error)
            toast.primaryAction = {
                title: "View Details",
                onAction: () => {
                    showToast({
                        style: Toast.Style.Failure,
                        title: "Error Details",
                        message: error instanceof Error ? error.message : String(error)
                    })
                }
            }

            throw error
        }
        setIsOptimistic(false)

        return { title, id }
    }

    return {
        datasets,
        isLoading,
        createDataset,
        revalidateDatasets: mutate
    }
}
