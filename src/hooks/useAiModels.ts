import { getPreferenceValues, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"

const DEV_BASE_URL = "http://localhost:5873"

export interface AiProvider {
    id: string
    name: string
}

export interface AiModel {
    id: string
    provider: AiProvider
    name: string
    description: string
    capabilities: string[]
}

// Get the API key from preferences
const getAuthHeader = () => {
    const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()
    return {
        Authorization: `Bearer ${apiKey}`
    }
}

export function useAiModels({ initialData }: { initialData: { value?: AiModel[]; isLoading: boolean } }) {
    // could definitely remove this entirely unless we add a func that modifies and needs to revalidate independent of the initialData
    const { isLoading, data: models } = useFetch<AiModel[]>(`${DEV_BASE_URL}/api/ai/models`, {
        headers: {
            ...getAuthHeader()
        },
        keepPreviousData: true,
        onError: error => {
            console.error("Error fetching AI models:", error)
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to load AI models",
                message: error instanceof Error ? error.message : String(error)
            })
        },
        execute: false
    })

    return {
        isLoading: initialData.isLoading || isLoading,
        models: models ?? initialData.value
    }
}
