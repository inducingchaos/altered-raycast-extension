/**
 *
 */

import {
    Action,
    ActionPanel,
    getPreferenceValues,
    Icon,
    List,
    showToast,
    Toast,
    Color,
    Form,
    useNavigation
} from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"
import "~/domains/shared/utils/polyfills"
import { DateTime } from "luxon"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BASE_URL = "https://altered.app"
const DEV_BASE_URL = "http://localhost:5873"

type __Thought = {
    id: string
    userId: string
    content: string
    attachmentId: string | null
    createdAt: Date
    updatedAt: Date
    // Dynamic key-value pairs appended to the thought object
    [key: string]: string | number | Date | null | boolean
}

// Use utils to safely extract properties from the Thought object
const getThoughtAlias = (thought: __Thought): string => {
    const alias = thought["alias"]
    return typeof alias === "string" && alias.trim() !== "" ? alias : `Thought ${thought.id}`
}

const isThoughtValidated = (thought: __Thought): boolean => {
    // Check for attachmentId first (backwards compatibility)
    if (thought.attachmentId) return true

    // Then check for the validated property
    const validated = thought["validated"]
    if (typeof validated === "string") {
        return validated.toLowerCase() === "true"
    } else if (typeof validated === "boolean") {
        return validated
    }
    return false
}

// type __CreatableThought = {
//     userId: string
//     content: string
// }

// const createThoughtRequestInit = (thought: Partial<__Thought>): RequestInit => ({
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ thought })
// })

const createThoughtEndpoint = (searchText: string): string =>
    `https://altered.app/api/thoughts?${new URLSearchParams({ search: searchText })}`

export default function Find() {
    const [searchText, setSearchText] = useState("")
    const [isOptimistic, setIsOptimistic] = useState(false)
    const [inspectorVisibility, setInspectorVisibility] = useState<"visible" | "hidden">("hidden")
    const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null)

    const {
        isLoading,
        mutate,
        data: thoughts
    } = useFetch<__Thought[]>(createThoughtEndpoint(searchText), {
        headers: {
            Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
        },
        execute: !isOptimistic
    })

    // const handleCreateThought = async (thought: __CreatableThought) => {
    //     setIsOptimistic(true)
    //     setSearchText("")

    //     const toast = await showToast({ style: Toast.Style.Animated, title: "Creating thought..." })

    //     try {
    //         await mutate(fetch(`https://altered.app/api/raycast/ingest`, createThoughtRequestInit(thought)), {
    //             optimisticUpdate(data) {
    //                 const thoughts = data as __Thought[]
    //                 return [
    //                     {
    //                         id: 0,
    //                         content: thought.content,
    //                         attachmentId: null,
    //                         createdAt: new Date(),
    //                         updatedAt: new Date()
    //                     },

    //                     ...thoughts
    //                 ]
    //             }
    //         })

    //         // yay, the API call worked!
    //         toast.style = Toast.Style.Success
    //         toast.title = "Foo appended"
    //     } catch (err) {
    //         // oh, the API call didn't work :(
    //         // the data will automatically be rolled back to its previous value
    //         toast.style = Toast.Style.Failure
    //         toast.title = "Could not append Foo"
    //         toast.message = err instanceof Error ? err.message : String(err)
    //     }

    //     setIsOptimistic(false)
    // }

    // const [characterCount, setCharacterCount] = useState(0)

    const handleDeleteThought = async (thoughtId: string) => {
        setIsOptimistic(true)

        const toast = await showToast({ style: Toast.Style.Animated, title: "Deleting thought..." })

        try {
            const deleteRequest = fetch(`https://altered.app/api/thoughts/${thoughtId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                }
            })

            await mutate(deleteRequest, {
                optimisticUpdate(data) {
                    const thoughts = data as __Thought[]
                    return thoughts.filter(t => t.id !== thoughtId)
                }
            })

            toast.style = Toast.Style.Success
            toast.title = "Thought deleted"
        } catch (err) {
            toast.style = Toast.Style.Failure
            toast.title = "Failed to delete thought"
        }

        setIsOptimistic(false)
    }

    const toggleThoughtValidation = async (thought: __Thought) => {
        setIsOptimistic(true)

        const currentValidation = isThoughtValidated(thought)
        const newValidation = !currentValidation

        // don't show toast unless error

        // const toast = await showToast({
        //     style: Toast.Style.Animated,
        //     title: `${newValidation ? "Validating" : "Invalidating"} thought...`
        // })

        try {
            // Create the fetch request but don't await it yet to keep updates optimistic
            const fetchRequest = fetch(`${DEV_BASE_URL}/api/thoughts/${thought.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                },
                body: JSON.stringify({ TEMP_validated: newValidation ? "true" : "false" })
            })

            // Perform optimistic update immediately
            const response = await mutate(fetchRequest, {
                optimisticUpdate(data) {
                    const thoughts = data as __Thought[]
                    return thoughts.map(t => {
                        if (t.id === thought.id) {
                            return {
                                ...t,
                                validated: newValidation ? "true" : "false"
                            }
                        }
                        return t
                    })
                }
            })

            // Check if the API call actually succeeded
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                const errorMessage = errorData.message || `Failed with status ${response.status}`

                console.log(errorData)

                throw new Error(errorMessage)
            }
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: `Failed to ${newValidation ? "validate" : "invalidate"} thought`,
                message: error instanceof Error ? error.message : String(error)
            })

            // Force a refresh to ensure UI is in sync with server state
            mutate()
        }

        setIsOptimistic(false)
    }

    const handleEditThought = async (thought: __Thought, updatedFields: Record<string, string | boolean>) => {
        setIsOptimistic(true)

        try {
            // Create TEMP_ prefixed versions of the fields for the API
            const apiFields: Record<string, string | boolean> = {}
            Object.entries(updatedFields).forEach(([key, value]) => {
                if (key !== "id" && key !== "createdAt" && key !== "updatedAt" && key !== "attachmentId") {
                    apiFields[`TEMP_${key}`] = value
                }
            })

            // Create the fetch request
            const fetchRequest = fetch(`${DEV_BASE_URL}/api/thoughts/${thought.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getPreferenceValues<{ "api-key": string }>()["api-key"]}`
                },
                body: JSON.stringify(apiFields)
            })

            // Perform optimistic update immediately
            const response = await mutate(fetchRequest, {
                optimisticUpdate(data) {
                    const thoughts = data as __Thought[]
                    return thoughts.map(t => {
                        if (t.id === thought.id) {
                            return {
                                ...t,
                                ...updatedFields
                            }
                        }
                        return t
                    })
                }
            })

            // Check if the API call actually succeeded
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                const errorMessage = errorData.message || `Failed with status ${response.status}`
                throw new Error(errorMessage)
            }
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to update thought",
                message: error instanceof Error ? error.message : String(error)
            })

            // Force a refresh to ensure UI is in sync with server state
            mutate()
        }

        setIsOptimistic(false)
    }

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={searchText => {
                setSearchText(searchText)
            }}
            searchBarPlaceholder="A thought..."
            searchText={searchText}
            throttle
            isShowingDetail={inspectorVisibility === "visible"}
            selectedItemId={selectedThoughtId === null ? undefined : selectedThoughtId}
            onSelectionChange={setSelectedThoughtId}
            // navigationTitle="WHAT DOES THIS MEAN?"
            // searchBarAccessory={<CharacterCountDropdown characterCount={characterCount} />}
        >
            {thoughts?.map(thought => (
                <ThoughtListItem
                    key={thought.id}
                    thought={thought}
                    onDelete={handleDeleteThought}
                    toggleValidation={toggleThoughtValidation}
                    onEdit={handleEditThought}
                    inspectorVisibility={inspectorVisibility}
                    toggleInspector={() => setInspectorVisibility(inspectorVisibility === "visible" ? "hidden" : "visible")}
                    isSelected={selectedThoughtId === thought.id}
                />
            ))}
        </List>
    )
}

function ThoughtListItem({
    thought,
    onDelete,
    toggleValidation,
    onEdit,
    inspectorVisibility,
    toggleInspector,
    isSelected
}: {
    thought: __Thought
    onDelete: (id: string) => Promise<void>
    toggleValidation: (thought: __Thought) => Promise<void>
    onEdit: (thought: __Thought, updatedFields: Record<string, string | boolean>) => Promise<void>
    inspectorVisibility: "visible" | "hidden"
    toggleInspector: () => void
    isSelected: boolean
}) {
    // Get the alias and validation status using the helper functions
    const alias = getThoughtAlias(thought)
    const isValidated = isThoughtValidated(thought)

    // Determine title and subtitle based on inspector visibility and selection state
    let title: string
    let subtitle: string | undefined

    if (inspectorVisibility === "visible") {
        if (isSelected) {
            // When inspector is open and item is selected - show title in white
            title = alias
            subtitle = undefined
        } else {
            // When inspector is open and item is not selected - show title in gray
            title = "" // Empty title
            subtitle = alias // Text goes in subtitle for gray color
        }
    } else {
        // When inspector is closed - normal display
        title = alias
        subtitle = formatSubtitle(thought)
    }

    // Create accessories that will only be shown when inspector is hidden
    const accessories =
        inspectorVisibility === "hidden"
            ? [
                  // Creation date
                  {
                      date: new Date(thought.createdAt),
                      tooltip: "Created on"
                  },
                  // Validation status with green check icon or secondary circle
                  isValidated
                      ? {
                            icon: { source: Icon.CheckCircle, tintColor: Color.SecondaryText },
                            tooltip: "Validated thought"
                        }
                      : {
                            icon: { source: Icon.Circle, tintColor: Color.SecondaryText },
                            tooltip: "Not validated"
                        }
              ]
            : []

    const updatedAt = DateTime.fromJSDate(new Date(thought.updatedAt)).toLocaleString({ month: "long", day: "numeric" })

    return (
        <List.Item
            id={thought.id.toString()}
            title={title}
            subtitle={subtitle}
            accessories={accessories}
            detail={
                <List.Item.Detail
                    markdown={`## ${thought.content}`}
                    metadata={
                        <List.Item.Detail.Metadata>
                            {/* <List.Item.Detail.Metadata.Label title="Content" text={thought.content} />
                            <List.Item.Detail.Metadata.Separator /> */}
                            <List.Item.Detail.Metadata.Label
                                title="Created At"
                                text={new Date(thought.createdAt).toLocaleDateString(undefined, {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="Updated At" text={updatedAt} />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label
                                title="Validated"
                                // icon={
                                //     isValidated
                                //         ? {
                                //               source: Icon.CheckCircle
                                //               //   tintColor: Color.Green
                                //           }
                                //         : {
                                //               source: Icon.Circle
                                //               //   tintColor: Color.SecondaryText
                                //           }
                                // }
                                text={isValidated ? "true" : "false"}
                            />
                            {Object.entries(thought)
                                .filter(
                                    ([key]) =>
                                        ![
                                            "id",
                                            "content",
                                            "attachmentId",
                                            "createdAt",
                                            "updatedAt",
                                            "alias",
                                            "validated"
                                        ].includes(key) &&
                                        thought[key] !== null &&
                                        thought[key] !== undefined
                                )
                                .map(([key, value]) => (
                                    <>
                                        <List.Item.Detail.Metadata.Separator />
                                        <List.Item.Detail.Metadata.Label
                                            key={key}
                                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                                            text={String(value)}
                                        />
                                    </>
                                ))}
                        </List.Item.Detail.Metadata>
                    }
                />
            }
            actions={
                <ActionPanel>
                    <Action.CopyToClipboard
                        title="Copy Content"
                        content={thought.content}
                        shortcut={{ modifiers: ["cmd"], key: "." }}
                    />
                    <Action
                        title={`${inspectorVisibility === "visible" ? "Hide" : "Show"} Inspector`}
                        icon={inspectorVisibility === "visible" ? Icon.EyeDisabled : Icon.Eye}
                        shortcut={{ modifiers: ["cmd"], key: "i" }}
                        onAction={toggleInspector}
                    />
                    <Action.Push
                        title="Edit Thought"
                        icon={Icon.Pencil}
                        shortcut={{ modifiers: ["cmd"], key: "e" }}
                        target={<EditThoughtForm thought={thought} onSubmit={fields => onEdit(thought, fields)} />}
                    />
                    <Action
                        title={`${isValidated ? "Invalidate" : "Validate"} Thought`}
                        icon={isValidated ? Icon.XMarkCircle : Icon.CheckCircle}
                        shortcut={{ modifiers: ["opt"], key: "v" }}
                        onAction={() => toggleValidation(thought)}
                    />
                    <Action
                        title="Delete Thought"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={{ modifiers: ["cmd"], key: "delete" }}
                        onAction={() => onDelete(thought.id)}
                    />
                </ActionPanel>
            }
        />
    )
}

function EditThoughtForm({
    thought,
    onSubmit
}: {
    thought: __Thought
    onSubmit: (fields: Record<string, string | boolean>) => Promise<void>
}) {
    const { pop } = useNavigation()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form values
    const [content, setContent] = useState(thought.content)
    const [alias, setAlias] = useState(getThoughtAlias(thought))
    const [validated, setValidated] = useState(isThoughtValidated(thought))

    // Create state for custom fields
    const [customFields, setCustomFields] = useState<Record<string, string>>({})

    // Initialize custom fields from thought object
    useState(() => {
        const fields: Record<string, string> = {}
        Object.entries(thought).forEach(([key, value]) => {
            if (
                !["id", "content", "attachmentId", "createdAt", "updatedAt", "alias", "validated"].includes(key) &&
                value !== null &&
                value !== undefined
            ) {
                fields[key] = String(value)
            }
        })
        setCustomFields(fields)
    })

    const handleSubmit = async () => {
        setIsSubmitting(true)

        try {
            // Combine all fields
            const updatedFields: Record<string, string | boolean> = {
                content,
                alias,
                validated
            }

            // Add custom fields
            Object.entries(customFields).forEach(([key, value]) => {
                updatedFields[key] = value
            })

            await onSubmit(updatedFields)
            pop()
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: "Failed to update thought",
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
                    <Action.SubmitForm title="Save Changes" onSubmit={handleSubmit} />
                </ActionPanel>
            }
            searchBarAccessory={<Form.LinkAccessory target={`${DEV_BASE_URL}/thoughts/${thought.id}`} text="Open in ALTERED" />}
        >
            <Form.Description text="Text" />
            <Form.DatePicker id="createdAt" title="Created At" value={new Date(thought.createdAt)} />
            <Form.Dropdown id="updatedAt" title="Updated At" value={new Date(thought.updatedAt)} />

            <Form.TextArea id="content" title="Content" value={content} onChange={setContent} />
            <Form.TextField id="alias" title="Alias" info="What info" placeholder="SSD" value={alias} onChange={setAlias} />

            <Form.Description title="Title" text="Text" />

            <Form.Checkbox
                id="validated"
                label="True"
                info="What info"
                title="Validated"
                value={validated}
                onChange={setValidated}
            />
            <Form.Separator />

            <Form.Description title="Metadata" text="Non-editable parameters." />
            <Form.Description
                title="Created At"
                text={new Date(thought.createdAt).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })}
            />
            <Form.Description
                title="Updated At"
                text={new Date(thought.updatedAt).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })}
            />

            <Form.Separator />
            <Form.Description title="Custom Fields" text="Additional properties" />

            {Object.entries(customFields).map(([key, value]) => (
                <Form.TextField
                    key={key}
                    id={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={value}
                    onChange={newValue => {
                        setCustomFields(prev => ({
                            ...prev,
                            [key]: newValue
                        }))
                    }}
                />
            ))}
        </Form>
    )
}

// Format a nicer subtitle with relevant information
function formatSubtitle(thought: __Thought): string {
    // Extract the first line or first 50 characters of content
    const contentPreview = thought.content.split("\n")[0].substring(0, 50) + (thought.content.length > 50 ? "..." : "")

    return contentPreview
}

// function CharacterCountDropdown(props: { characterCount: number; onCharacterCountChange?: (newValue: number) => void }) {
//     const { characterCount, onCharacterCountChange } = props
//     return (
//         <List.Dropdown
//             tooltip="Character Count"
//             storeValue={true}
//             onChange={newValue => {
//                 onCharacterCountChange?.(parseInt(newValue))
//             }}
//         >
//             <List.Dropdown.Section title="Character Count">
//                 <List.Dropdown.Item key={1} title={`${characterCount}/255`} value={"1"} />
//             </List.Dropdown.Section>
//         </List.Dropdown>
//     )
// }
