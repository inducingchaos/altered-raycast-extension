/**
 *
 */

import { Action, ActionPanel, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"
import "~/domains/shared/utils/polyfills"

type __Thought = {
    id: number
    content: string
    TEMP_alias: string
    attachmentId: string | null
    createdAt: Date
    updatedAt: Date
}

type __ThoughtWithAlias = __Thought & { alias: string }

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

    const {
        isLoading,
        mutate,
        data: thoughts
    } = useFetch<__ThoughtWithAlias[]>(createThoughtEndpoint(searchText), {
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

    const handleDeleteThought = async (thoughtId: number) => {
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
                    const thoughts = data as __ThoughtWithAlias[]
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

    const [inspectorVisibility, setInspectorVisibility] = useState<"visible" | "hidden">("hidden")

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
            // navigationTitle="WHAT DOES THIS MEAN?"
            // searchBarAccessory={<CharacterCountDropdown characterCount={characterCount} />}
        >
            {thoughts?.map(thought => (
                <ThoughtListItem
                    key={thought.id}
                    thought={thought}
                    onDelete={handleDeleteThought}
                    inspectorVisibility={inspectorVisibility}
                    toggleInspector={() => setInspectorVisibility(inspectorVisibility === "visible" ? "hidden" : "visible")}
                />
            ))}
        </List>
    )
}

function ThoughtListItem({
    thought,
    onDelete,
    inspectorVisibility,
    toggleInspector
}: {
    thought: __ThoughtWithAlias
    onDelete: (id: number) => Promise<void>
    inspectorVisibility: "visible" | "hidden"
    toggleInspector: () => void
}) {
    return (
        <List.Item
            title={thought.alias}
            subtitle={thought.content}
            detail={
                <List.Item.Detail
                    markdown={`# My Name\n${"```"}plaintext\n${thought.content}\n\n#tag #things #here #it #should #look #better #in #the #list #view #in #the #detail #instead #of #the #metadata #view\n${"```"}\n## Tags`}
                    metadata={
                        <List.Item.Detail.Metadata>
                            <List.Item.Detail.Metadata.Label
                                title="Created At"
                                text={new Date(thought.createdAt).toLocaleString()}
                            />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label
                                title="Updated At"
                                text={new Date(thought.updatedAt).toLocaleString()}
                            />
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
