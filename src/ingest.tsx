/**
 *
 */

import { Action, ActionPanel, List } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"

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

export default function Command() {
    const [searchText, setSearchText] = useState("")
    const [thoughts, setThoughts] = useState([] as Thought[])

    const { isLoading: initialDataIsLoading } = useFetch(
        `https://altered.app/api/raycast/ingest?${new URLSearchParams({ q: searchText })}`,
        { onData: setThoughts }
    )

    const thought = {
        userId: 1,
        content: searchText
    }

    const appendCreatedThought = (thought: Thought) => {
        setThoughts(prev => [...prev, thought])
        setRunCreateThought(false)
        setSearchText("")
    }

    const createThoughtInit = (thought: Partial<Thought>) => ({
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ thought })
    })

    const [runCreateThought, setRunCreateThought] = useState(false)

    const { isLoading: createThoughtIsLoading } = useFetch(`https://altered.app/api/raycast/ingest`, {
        ...createThoughtInit(thought),
        execute: runCreateThought,
        onData: appendCreatedThought
    })

    const [characterCount, setCharacterCount] = useState(0)

    return (
        <List
            isLoading={initialDataIsLoading || createThoughtIsLoading}
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
                        <Action title="Create Thought" onAction={() => setRunCreateThought(true)} />
                    </ActionPanel>
                }
            />
            {thoughts?.map(thought => <ThoughtListItem key={thought.id} thought={thought} />)}
        </List>
    )
}

function ThoughtListItem({ thought }: { thought: Thought }) {
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
                        title="Copy Install Command"
                        content={thought.content}
                        shortcut={{ modifiers: ["cmd"], key: "." }}
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
