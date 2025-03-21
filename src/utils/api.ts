import { getPreferenceValues } from "@raycast/api"

const DEV_BASE_URL = "http://localhost:5873"

// Type definitions
export interface Prompt {
    id: string
    promptId: string
    name: string
    content: string
    createdAt?: string
    updatedAt?: string
}

// Get the API key from preferences
const getAuthHeader = () => {
    console.log("Getting auth header from preferences")
    const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()
    return {
        Authorization: `Bearer ${apiKey}`
    }
}

// Fetch all prompts
export const fetchPrompts = async (): Promise<Prompt[]> => {
    console.log("fetchPrompts: Starting API request")
    const url = `${DEV_BASE_URL}/api/preferences/prompts`
    console.log("fetchPrompts: Requesting URL:", url)

    const response = await fetch(url, {
        headers: {
            ...getAuthHeader()
        }
    })

    console.log("fetchPrompts: Response status:", response.status)

    if (!response.ok) {
        console.error("fetchPrompts: API error:", response.statusText)
        throw new Error(`Failed to fetch prompts: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("fetchPrompts: Received data for", data.length, "prompts")
    return data
}

// Fetch a specific prompt
export const fetchPrompt = async (promptId: string): Promise<Prompt> => {
    console.log("fetchPrompt: Starting API request for prompt:", promptId)
    const response = await fetch(`${DEV_BASE_URL}/api/preferences/prompts/${promptId}`, {
        headers: {
            ...getAuthHeader()
        }
    })

    console.log("fetchPrompt: Response status:", response.status)

    if (!response.ok) {
        console.error("fetchPrompt: API error:", response.statusText)
        throw new Error(`Failed to fetch prompt: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("fetchPrompt: Received data for prompt:", promptId)
    return data
}

// Update a prompt
export const updatePrompt = async (promptId: string, content: string, name?: string): Promise<Prompt> => {
    console.log("updatePrompt: Starting API request for prompt:", promptId)
    const bodyData = {
        content,
        ...(name && { name })
    }
    console.log(
        "updatePrompt: Request body:",
        JSON.stringify(bodyData).substring(0, 100) + (bodyData.content.length > 100 ? "..." : "")
    )

    const response = await fetch(`${DEV_BASE_URL}/api/preferences/prompts/${promptId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify(bodyData)
    })

    console.log("updatePrompt: Response status:", response.status)

    if (!response.ok) {
        console.error("updatePrompt: API error:", response.statusText)
        throw new Error(`Failed to update prompt: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("updatePrompt: Prompt updated successfully:", promptId)
    return data
}
