/**
 *
 */

import { List } from "@raycast/api"
import { useState } from "react"
import { ThoughtListItem } from "./components/thought/ThoughtListItem"
import { useThoughts } from "./hooks/useThoughts"

export default function Find() {
    const [searchText, setSearchText] = useState("")
    const [inspectorVisibility, setInspectorVisibility] = useState<"visible" | "hidden">("hidden")
    const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null)

    const { thoughts, isLoading, handleDeleteThought, toggleThoughtValidation, handleEditThought } = useThoughts(searchText)

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder="A thought..."
            searchText={searchText}
            throttle
            isShowingDetail={inspectorVisibility === "visible"}
            selectedItemId={selectedThoughtId === null ? undefined : selectedThoughtId}
            onSelectionChange={setSelectedThoughtId}
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
