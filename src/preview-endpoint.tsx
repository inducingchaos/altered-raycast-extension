import { Action, ActionPanel, Detail, Form, Icon, showToast, Toast, useNavigation, closeMainWindow } from "@raycast/api"
import { useState } from "react"
import { getPreferenceValues } from "@raycast/api"

const DEV_BASE_URL = "http://localhost:5873"

// Define the endpoints we want to support
const ENDPOINTS = [
    {
        id: "prompt-preview",
        name: "Prompt Preview",
        url: `${DEV_BASE_URL}/api/dev/prompts/{path_param}/preview`,
        description: "Preview a templated prompt with example data"
    }
]

// Response interface
interface EndpointResponse {
    raw?: string
    processed?: string
    allowedVariables?: string[]
    [key: string]: unknown // Allow for other properties in a type-safe way
}

// Component to display the API response
function ResponseDetailView({
    endpoint,
    pathParam,
    response,
    isLoading
}: {
    endpoint: (typeof ENDPOINTS)[0]
    pathParam: string
    response: EndpointResponse | null
    isLoading: boolean
}) {
    // Generate markdown for the response
    const generateMarkdown = () => {
        if (!response) return "No data returned"

        let markdown = ``

        // Add metadata section
        markdown += `# Metadata\n\n`
        markdown += `**\`Endpoint:\`**\`${endpoint.url.replace("    {path_param}", pathParam)}\`\n\n`

        // Add each property as a section
        Object.entries(response).forEach(([key, value]) => {
            // Rename 'raw' to 'text' and 'processed' to 'computed' for display
            const displayKey = key === "raw" ? "text" : key === "processed" ? "computed" : key

            if (key === "allowedVariables" && Array.isArray(value)) {
                markdown += `## Allowed Variables\n\n`
                if (value.length === 0) {
                    markdown += "_No variables available_\n\n"
                } else {
                    value.forEach(variable => {
                        markdown += `- \`{{${variable}}}\`\n`
                    })
                    markdown += "\n"
                }
            } else if (typeof value === "string") {
                markdown += `# ${displayKey.charAt(0).toUpperCase() + displayKey.slice(1)}\n\n`
                markdown += value + "\n\n"
            } else {
                markdown += `# ${displayKey.charAt(0).toUpperCase() + displayKey.slice(1)}\n\n`
                markdown += JSON.stringify(value, null, 2) + "\n\n"
            }
        })

        return markdown
    }

    return (
        <Detail
            navigationTitle={`${pathParam} API Explorer`}
            markdown={generateMarkdown()}
            isLoading={isLoading}
            actions={
                <ActionPanel>
                    <Action
                        title="Close"
                        icon={Icon.XmarkCircle}
                        onAction={() => closeMainWindow()}
                        shortcut={{ modifiers: [], key: "return" }}
                    />
                    <Action.CopyToClipboard
                        title="Copy Raw Response"
                        content={JSON.stringify(response, null, 2)}
                        shortcut={{ modifiers: ["cmd"], key: "c" }}
                    />
                </ActionPanel>
            }
        />
    )
}

export default function Command() {
    const [selectedEndpointId, setSelectedEndpointId] = useState<string>(ENDPOINTS[0].id)
    const [pathParam, setPathParam] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { push } = useNavigation()

    // Get user's API key from preferences
    const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()

    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            const selectedEndpoint = ENDPOINTS.find(e => e.id === selectedEndpointId)
            if (!selectedEndpoint) {
                throw new Error("Invalid endpoint selected")
            }

            if (!pathParam.trim()) {
                throw new Error("Path parameter is required")
            }

            // Replace path parameter in the URL
            const url = selectedEndpoint.url.replace("{path_param}", pathParam)

            // Show loading toast
            const toast = await showToast({
                style: Toast.Style.Animated,
                title: "Loading endpoint data",
                message: `Fetching from ${url}`
            })

            // Make API request
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                }
            })

            // Check response status
            if (!response.ok) {
                const errorText = await response.text().catch(() => `HTTP error ${response.status}`)
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
            }

            // Parse response
            const data = await response.json()

            // Success toast
            toast.style = Toast.Style.Success
            toast.title = "Data loaded successfully"

            // Push to detail view
            push(<ResponseDetailView endpoint={selectedEndpoint} pathParam={pathParam} response={data} isLoading={false} />)
        } catch (error) {
            console.error("API error:", error)

            // Show error toast
            await showToast({
                style: Toast.Style.Failure,
                title: "Failed to load data",
                message: error instanceof Error ? error.message : String(error)
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form
            isLoading={isSubmitting}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Preview Endpoint" icon={Icon.Eye} onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.Description title="API Endpoint Preview" text="Preview responses from the development API endpoints" />

            <Form.Dropdown id="endpoint" title="Endpoint" value={selectedEndpointId} onChange={setSelectedEndpointId}>
                {ENDPOINTS.map(endpoint => (
                    <Form.Dropdown.Item key={endpoint.id} value={endpoint.id} title={endpoint.name} icon={Icon.Globe} />
                ))}
            </Form.Dropdown>

            <Form.TextField
                id="pathParam"
                title="Path Parameter"
                placeholder="e.g. thought-generation"
                value={pathParam}
                onChange={setPathParam}
                info={`The path parameter to insert in the URL. For the currently selected endpoint this replaces {path_param} in: ${ENDPOINTS.find(e => e.id === selectedEndpointId)?.url}`}
            />
        </Form>
    )
}
