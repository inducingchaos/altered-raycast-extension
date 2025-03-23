import { Clipboard, showToast, Toast, closeMainWindow, getPreferenceValues, open } from "@raycast/api"
import { createDeeplink, runAppleScript } from "@raycast/utils"

// Use localhost for development/testing
const DEV_BASE_URL = "http://localhost:5873"

export default async function Command() {
    try {
        // First try to copy selected text, then attempt to cut if editable
        // This ensures we get the content regardless of whether the text field is editable

        await runAppleScript(`
          tell application "System Events"
            -- First copy the selected text
            keystroke "c" using {command down}
            -- Then try to cut it (will only work if editable)
            delay 0.1
            keystroke "x" using {command down}
          end tell
        `)

        // Small delay to ensure clipboard is updated
        await new Promise(resolve => setTimeout(resolve, 100))

        // Now read the clipboard text (which should contain the cut text)
        const text = await Clipboard.readText()
        console.log("Clipboard content:", text ? `${text.substring(0, 50)}${text.length > 50 ? "..." : ""}` : "No text found")

        if (!text) {
            await showToast({
                style: Toast.Style.Failure,
                title: "No text selected or in clipboard"
            })
            await closeMainWindow()
            return
        }

        // Show loading toast
        const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Uploading Thought"
        })

        // Get API key from preferences
        const { "api-key": apiKey } = getPreferenceValues<{ "api-key": string }>()
        console.log("Using API key:", apiKey ? "API key found" : "No API key found")

        // Prepare request data
        const data = { TEMP_content: text }
        console.log("Sending data:", JSON.stringify(data))

        // Submit the thought with only the content field
        console.log(`Sending request to: ${DEV_BASE_URL}/api/thoughts/create`)
        const response = await fetch(`${DEV_BASE_URL}/api/thoughts/create`, {
            method: "POST",
            body: JSON.stringify([data]),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            }
        })

        // Close the main window immediately after sending the request
        await closeMainWindow()

        // Log response details
        console.log("Response status:", response.status)
        console.log("Response status text:", response.statusText)

        // Handle response
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Could not parse error response")
            console.error("Error response body:", errorText)

            toast.style = Toast.Style.Failure
            toast.title = "Error Uploading Thought"
            toast.message = `Status: ${response.status}, ${errorText.substring(0, 100)}`
            return
        }

        const responseData = await response.json().catch(() => "Could not parse JSON response")
        console.log("Success response:", JSON.stringify(responseData))

        // Update toast on success
        toast.style = Toast.Style.Success
        toast.title = `Created Thought: "${text.length > 8 ? text.substring(0, 5) : text}${text.length > 8 ? "..." : ""}${text.length > 8 ? text.substring(text.length - 5) : ""}"`
        toast.message = `This is a message."`
        toast.primaryAction = {
            title: "Open in Raycast",
            onAction: () => {
                console.log("Open in Raycast")

                const deeplink = createDeeplink({
                    // Replace with your extension's owner/author name
                    ownerOrAuthorName: "inducingchaos",
                    extensionName: "altered",
                    command: "find",
                    context: {
                        thoughtId: "test"
                    }
                })

                open(deeplink)
            },
            shortcut: {
                // FIGURE OUT A MODIFIER FOR THIS
                modifiers: ["cmd", "shift", "opt", "ctrl"],
                key: "arrowDown"
            }
        }

        // await a .5s delay
        await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
        console.error("Exception caught:", error)

        // Show detailed error toast if something goes wrong
        await showToast({
            style: Toast.Style.Failure,
            title: "Error",
            message: error instanceof Error ? `${error.name}: ${error.message}` : "Unknown error occurred"
        })
    }
}
