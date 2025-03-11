import { Action, ActionPanel, Detail, getPreferenceValues, Icon, List, showToast, Toast, useNavigation } from "@raycast/api"
import { useEffect, useState } from "react"

import "~/domains/shared/utils/polyfills"

// Get API key from preferences
const preferences = getPreferenceValues<{ "api-key": string }>()

// Detail view component that displays the generated content
function GeneratedContentView({ prompt, isLoading, content }: { prompt: string; isLoading: boolean; content: string }) {
    const { pop } = useNavigation()

    console.log(prompt)

    return (
        <Detail
            navigationTitle={`Generated: ${prompt.slice(0, 30)}${prompt.length > 30 ? "..." : ""}`}
            markdown={content}
            metadata={
                <Detail.Metadata>
                    <Detail.Metadata.Label title="Input" text={prompt} />
                </Detail.Metadata>
            }
            isLoading={isLoading}
            actions={
                <ActionPanel>
                    <Action.CopyToClipboard
                        title="Copy to Clipboard"
                        content={content}
                        shortcut={{ modifiers: ["cmd"], key: "c" }}
                    />
                    <Action
                        title="New Generation"
                        icon={Icon.ArrowCounterClockwise}
                        onAction={pop}
                        shortcut={{ modifiers: ["cmd"], key: "n" }}
                    />
                </ActionPanel>
            }
        />
    )
}

export default function Command() {
    const [searchText, setSearchText] = useState("")
    const { push } = useNavigation()

    useEffect(() => {
        console.log(searchText)
    }, [searchText])

    const handleGenerate = async () => {
        if (searchText.trim() === "") {
            await showToast(Toast.Style.Failure, "Please enter a prompt")
            return
        }

        // Push to Detail view and start streaming content
        push(<GeneratingView prompt={searchText} />)
    }

    return (
        <List
            onSearchTextChange={setSearchText}
            searchText={searchText}
            searchBarPlaceholder="Enter your prompt here..."
            throttle={false}
            actions={
                <ActionPanel>
                    <Action title="Generate" onAction={handleGenerate} shortcut={{ modifiers: ["cmd"], key: "enter" }} />
                </ActionPanel>
            }
            searchBarAccessory={
                <ActionPanel>
                    <Action title="Generate" onAction={handleGenerate} shortcut={{ modifiers: [], key: "return" }} />
                </ActionPanel>
            }
        >
            <List.EmptyView title="Ready to Generate" description="Ask your ALTERED brain anything." icon={Icon.Stars} />
        </List>
    )
}

// Component that handles fetching and streaming the response
function GeneratingView({ prompt }: { prompt: string }) {
    const [content, setContent] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(true)

    // Simple fetch and stream handling
    useEffect(() => {
        let isMounted = true

        async function fetchStream() {
            try {
                const response = await fetch("https://altered.app/api/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${preferences["api-key"]}`,
                        Accept: "text/plain"
                    },
                    body: JSON.stringify({ prompt })
                })

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`)
                }

                if (!response.body) {
                    throw new Error("No response body")
                }

                // Get the reader from the response body stream
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let streamText = ""

                // Process each chunk as it comes in
                let reading = true
                while (reading) {
                    const { done, value } = await reader.read()
                    if (done) {
                        reading = false
                        break
                    }

                    // Decode the chunk and update the state
                    const chunk = decoder.decode(value, { stream: true })
                    streamText += chunk

                    if (isMounted) {
                        setContent(streamText)
                    }
                }

                // Ensure any remaining bytes are decoded
                const finalChunk = decoder.decode()
                if (finalChunk && isMounted) {
                    setContent(prev => prev + finalChunk)
                }

                if (isMounted) {
                    setIsLoading(false)
                }
            } catch (error) {
                console.error("Error fetching stream:", error)
                if (isMounted) {
                    setContent(`Error: ${error instanceof Error ? error.message : String(error)}`)
                    setIsLoading(false)
                }
            }
        }

        fetchStream()

        return () => {
            isMounted = false
        }
    }, [prompt])

    return <GeneratedContentView prompt={prompt} isLoading={isLoading} content={content} />
}
