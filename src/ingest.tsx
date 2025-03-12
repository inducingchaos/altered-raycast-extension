/**
 *
 */

import { Action, ActionPanel, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"
import "~/domains/shared/utils/polyfills"

type Thought = {
    id: number
    content: string
    attachmentId: string | null
    createdAt: Date
    updatedAt: Date
}

// type EssentialThought = {
//     userId: number
//     content: string
// }

// spell-checker:disable-next-line
const ME = "dFgkaKdK7T8b6HwJ8vycz"

const createThoughtInit = (thought: Partial<Thought>): RequestInit => ({
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ thought })
})

export default function Command() {
    const [searchText, setSearchText] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    const {
        isLoading: initialDataIsLoading,
        mutate,
        data: thoughts
    } = useFetch<Thought[]>(`https://altered.app/api/raycast/ingest?${new URLSearchParams({ q: searchText })}`, {
        execute: !isCreating
    })

    const TEST_creatableThought = {
        userId: "a",
        content: searchText
    }

    type CreatableThought = typeof TEST_creatableThought

    const handleCreateThought = async (thought: CreatableThought) => {
        setIsCreating(true)
        setSearchText("")

        const toast = await showToast({ style: Toast.Style.Animated, title: "Creating thought..." })

        try {
            await mutate(fetch(`https://altered.app/api/raycast/ingest`, createThoughtInit(thought)), {
                optimisticUpdate(data) {
                    const thoughts = data as Thought[]
                    return [
                        {
                            id: 0,
                            content: thought.content,
                            attachmentId: null,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },

                        ...thoughts
                    ]
                }
            })

            // yay, the API call worked!
            toast.style = Toast.Style.Success
            toast.title = "Foo appended"
        } catch (err) {
            // oh, the API call didn't work :(
            // the data will automatically be rolled back to its previous value
            toast.style = Toast.Style.Failure
            toast.title = "Could not append Foo"
            toast.message = err instanceof Error ? err.message : String(err)
        }

        setIsCreating(false)
    }

    const [characterCount, setCharacterCount] = useState(0)

    const handleThoughtDeleted = async (thoughtId: number) => {
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
                    const thoughts = data as Thought[]
                    return thoughts.filter(t => t.id !== thoughtId)
                }
            })

            toast.style = Toast.Style.Success
            toast.title = "Thought deleted"
        } catch (err) {
            toast.style = Toast.Style.Failure
            toast.title = "Failed to delete thought"
        }
    }
    return (
        <List
            isLoading={initialDataIsLoading}
            onSearchTextChange={searchText => {
                setSearchText(searchText)
                setCharacterCount(searchText.length)
            }}
            searchBarPlaceholder="Your thought..."
            searchText={searchText}
            throttle
            isShowingDetail
            // navigationTitle="WHAT DOES THIS MEAN?"
            searchBarAccessory={<CharacterCountDropdown characterCount={characterCount} />}
        >
            <List.Item
                title=""
                subtitle="Create thought..."
                actions={
                    <ActionPanel>
                        <Action
                            title="Create Thought"
                            onAction={() => handleCreateThought({ userId: ME, content: searchText })}
                        />
                    </ActionPanel>
                }
            />
            {thoughts?.map(thought => <ThoughtListItem key={thought.id} thought={thought} onDelete={handleThoughtDeleted} />)}
        </List>
    )
}

function ThoughtListItem({ thought, onDelete }: { thought: Thought; onDelete: (id: number) => Promise<void> }) {
    const handleDelete = async () => {
        // const toast = await showToast({ style: Toast.Style.Animated, title: "Deleting thought..." })

        try {
            await onDelete(thought.id)
            // toast.style = Toast.Style.Success
            // toast.title = "Thought deleted"
        } catch (error) {
            // toast.style = Toast.Style.Failure
            // toast.title = "Failed to delete thought"
            // toast.message = error instanceof Error ? error.message : String(error)
        }
    }

    return (
        <List.Item
            title={thought.content}
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
                        title="Delete Thought"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={{ modifiers: ["cmd"], key: "delete" }}
                        onAction={handleDelete}
                    />
                </ActionPanel>
            }
        />
    )
}

function CharacterCountDropdown(props: { characterCount: number; onCharacterCountChange?: (newValue: number) => void }) {
    const { characterCount, onCharacterCountChange } = props
    return (
        <List.Dropdown
            tooltip="Character Count"
            storeValue={true}
            onChange={newValue => {
                onCharacterCountChange?.(parseInt(newValue))
            }}
        >
            <List.Dropdown.Section title="Character Count">
                <List.Dropdown.Item key={1} title={`${characterCount}/255`} value={"1"} />
            </List.Dropdown.Section>
        </List.Dropdown>
    )
}
