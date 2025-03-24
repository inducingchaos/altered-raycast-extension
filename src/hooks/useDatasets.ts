import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { Dataset } from "../types/dataset"

const DEV_BASE_URL = "http://localhost:5873"

export const useDatasets = ({
    searchText,
    initialData
}: {
    searchText?: string
    initialData: { value?: Dataset[]; isLoading: boolean }
}) => {
    const {
        data: datasets = initialData.value,
        isLoading,
        mutate: revalidateDatasets
    } = useFetch<Dataset[]>(
        `${DEV_BASE_URL}/api/datasets${searchText ? `?${new URLSearchParams({ search: searchText })}` : ""}`,
        {
            headers: {
                Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
            },
            execute: !!searchText
        }
    )

    const createDataset = async (title: string) => {
        const toast = await showToast({ style: Toast.Style.Animated, title: "Creating dataset..." })

        try {
            // console.log("Creating dataset with title:", title)

            const response = await fetch(`${DEV_BASE_URL}/api/datasets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                },
                body: JSON.stringify({ title })
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

            // Revalidate datasets list
            await revalidateDatasets()
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
    }

    return {
        datasets,
        isLoading: initialData.isLoading || isLoading,
        createDataset,
        revalidateDatasets
    }
}
