/**
 *
 */

import { Action, ActionPanel, Detail, List } from "@raycast/api"
import { useMemo, useRef, useState } from "react"
import { ThoughtListItem } from "./components/thought/ThoughtListItem"
import { changeSelection } from "./find/select-without-spazzing"
import { useDatasets } from "./hooks/useDatasets"
import { useThoughts } from "./hooks/useThoughts"
import { Thought } from "./types/thought"
import { FRONTEND_HIDDEN_FIELDS, getThoughtAlias, isThoughtValidated } from "./utils/thought"

export default function Find() {
    const [searchText, setSearchText] = useState("")
    const [inspectorVisibility, setInspectorVisibility] = useState<"visible" | "hidden">("hidden")
    const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null)

    const [isRawMode, setIsRawMode] = useState(false)
    const [isLargeTypeMode, setIsLargeTypeMode] = useState(false)
    const [filter, setFilter] = useState<string>("")

    const {
        thoughts,
        isLoading,
        handleDeleteThought,
        toggleThoughtValidation,
        toggleMassThoughtValidation,
        massThoughtDeletion,
        handleEditThought,
        validateAllThoughts
    } = useThoughts(searchText)
    const { datasets, isLoading: isLoadingDatasets, createDataset } = useDatasets()

    const selectedThoughtIdUpdatedAt = useRef<number | undefined>()

    const onSelectionChange = (id: string | null) => {
        changeSelection({
            selectedItemId: id,
            setSelectedItemId: setSelectedThoughtId,
            selectedItemIdUpdatedAt: selectedThoughtIdUpdatedAt
        })
    }

    const toggleRawMode = () => {
        setIsRawMode(!isRawMode)
    }

    const toggleLargeTypeMode = () => {
        setIsLargeTypeMode(!isLargeTypeMode)
    }

    const [massSelection, setMassSelection] = useState<Set<string>>(new Set())

    // Add these new state variables for drag selection
    const [lastSelectionAction, setLastSelectionAction] = useState<"select" | "deselect">("select")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [lastSelectedItemId, setLastSelectedItemId] = useState<string | null>(null)

    // Filter thoughts based on selected filter
    const filteredThoughts = useMemo(() => {
        if (!thoughts || !filter) return thoughts

        if (filter === "validated-true") {
            return thoughts.filter(thought => isThoughtValidated(thought))
        }

        if (filter === "validated-false") {
            return thoughts.filter(thought => !isThoughtValidated(thought))
        }

        if (filter.startsWith("dataset-")) {
            const datasetId = filter.replace("dataset-", "")
            return thoughts.filter(thought => thought.datasets && thought.datasets.includes(datasetId))
        }

        return thoughts
    }, [thoughts, filter])

    const allThoughtsMassSelected: boolean = useMemo(() => {
        return filteredThoughts?.every(thought => massSelection.has(thought.id.toString())) ?? false
    }, [filteredThoughts, massSelection])

    const handleMassSelectAll = () => {
        // check if all filtered thoughts are already in the mass selection, deselect all if so, otherwise select all

        // we need to do a more comprehensive check than just length since we could change the filter and have the same number of thoughts

        if (allThoughtsMassSelected) {
            setMassSelection(new Set())
        } else {
            setMassSelection(new Set(filteredThoughts?.map(thought => thought.id) || []))
        }
    }

    // Get the selected thought for raw view
    const selectedThought = filteredThoughts?.find(thought => thought.id.toString() === selectedThoughtId)

    // Generate markdown for raw view
    const generateMarkdown = (thought: Thought | undefined): string => {
        if (!thought) return ""

        const markdown = []

        // Content first
        markdown.push(`**Content:**\n${thought.content}`)
        markdown.push("") // Add empty line for separation

        // Then other metadata
        markdown.push(`**Alias:** ${getThoughtAlias(thought)}`)
        markdown.push(`**Created:** ${new Date(thought.createdAt).toLocaleString()}`)
        markdown.push(`**Updated:** ${new Date(thought.updatedAt).toLocaleString()}`)
        markdown.push(`**Validated:** ${isThoughtValidated(thought) ? "Yes" : "No"}`)

        if (thought.datasets && thought.datasets.length > 0) {
            const datasetNames = thought.datasets
                .map((datasetId: string) => {
                    const dataset = datasets?.find(d => d.id === datasetId)
                    return dataset ? dataset.title : datasetId
                })
                .join(", ")
            markdown.push(`**Datasets:** ${datasetNames}`)
        } else {
            markdown.push(`**Datasets:** -`)
        }

        // Add any custom properties
        Object.entries(thought).forEach(([key, value]) => {
            if (
                !FRONTEND_HIDDEN_FIELDS.includes(key) &&
                !["content", "alias", "validated", "datasets"].includes(key) &&
                value !== null &&
                value !== undefined
            ) {
                markdown.push(`**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`)
            }
        })

        return markdown.join("\n")
    }

    // Prepare global actions object to pass to list items
    const globalActions = useMemo(
        () => ({
            validateAllThoughts
        }),
        [validateAllThoughts]
    )

    const handleDragSelection = (direction: "up" | "down") => {
        if (!filteredThoughts || !selectedThoughtId) return

        // Find the current index of the selected thought
        const currentIndex = filteredThoughts.findIndex(thought => thought.id.toString() === selectedThoughtId)
        if (currentIndex === -1) return

        // Calculate the target index based on direction
        const targetIndex =
            direction === "up" ? Math.max(0, currentIndex - 1) : Math.min(filteredThoughts.length - 1, currentIndex + 1)

        // Get the target thought
        const targetThought = filteredThoughts[targetIndex]
        if (!targetThought) return

        // Update the selected item ID to the target
        onSelectionChange(targetThought.id.toString())

        // Apply the last selection action to both current and target items
        const newMassSelection = new Set(massSelection)

        // Apply the action based on the last selection type
        if (lastSelectionAction === "select") {
            // If the last action was select, add both current and target items
            if (selectedThoughtId) newMassSelection.add(selectedThoughtId)
            newMassSelection.add(targetThought.id.toString())
        } else {
            // If the last action was deselect, remove both current and target items
            if (selectedThoughtId) newMassSelection.delete(selectedThoughtId)
            newMassSelection.delete(targetThought.id.toString())
        }

        // Update the mass selection
        setMassSelection(newMassSelection)

        // Update the last selected item
        setLastSelectedItemId(targetThought.id.toString())
    }

    // Add a function to toggle single item selection that also updates the last action
    const toggleSingleItemSelection = (thoughtId: string) => {
        const newMassSelection = new Set(massSelection)

        if (newMassSelection.has(thoughtId)) {
            newMassSelection.delete(thoughtId)
            setLastSelectionAction("deselect")
        } else {
            newMassSelection.add(thoughtId)
            setLastSelectionAction("select")
        }

        setMassSelection(newMassSelection)
        setLastSelectedItemId(thoughtId)
    }

    if (isLargeTypeMode && selectedThought) {
        return (
            <Detail
                markdown={isRawMode ? selectedThought.content : generateMarkdown(selectedThought)}
                navigationTitle={`${getThoughtAlias(selectedThought)} - ${isRawMode ? "Content" : "Details"}`}
                actions={
                    <ActionPanel>
                        <Action title="Toggle View Mode" shortcut={{ modifiers: ["opt"], key: "r" }} onAction={toggleRawMode} />
                        <Action
                            title={`${isThoughtValidated(selectedThought) ? "Invalidate" : "Validate"} Thought`}
                            shortcut={{ modifiers: ["opt"], key: "v" }}
                            onAction={() => toggleThoughtValidation(selectedThought)}
                        />
                        <Action
                            title="Exit Large Type Mode"
                            shortcut={{ modifiers: ["opt"], key: "l" }}
                            onAction={toggleLargeTypeMode}
                        />
                    </ActionPanel>
                }
            />
        )
    }

    // DRAG SELECT NOTES (DO NOT DELETE)

    // When a user shift-down or shift-up arrow - we want to "extend" the previous select action (either select or deselect)
    // we track the last action (select or deselect) with state - if someone cmd-s (single select) to enable selection, ALL drag selections should be select
    // if it was deselect, we drag-deselect all list items UNTIL we cmd-s to enable selection
    // we can get the last item that was selected by grabbing the last item from the massSelection array
    // when a user navigates with shift-(up/down), we need to also manually update the selectedItemId since the shortcut blocks the default behavior
    //  when drag-selecting (different than gap selection), we don't modify items BETWEEN - just the one we're coming from, and the one we're going to (due to the ergonomics we always select both (2 items) on every handleDragSelection)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleGapSelection = () => {
        // cmd-shift-s  all items in-between the last selected item and the current item
        // we always select/deselect based on the last action (select or deselect)
        // we modify selection for every item in-between the last selected item and the current item, including the current item
        // if ALL target items are already selected, we toggle them, INCLUDING the previous item
    }

    // FOR BOTH DRAG AND GAP SELECTION:
    //  Fallback: if no selection state exists, for the last select action (we set the initial state in useState to "select", so there's always a default) and for the last selected item (we default to the first item in the list OR the lastMassSelectedItem, another state)
    // Another state: even though we already store selected items in massSelection, we also need to track the last selected item IN CASE all items are deselected (massSelection is empty) OR the last action was a de-selection (lastAction = deselect)

    // add a cmd-d action to deselect all
    // ADD ALL ACTIONS TO THE LIST ITEM, not list
    return (
        <List
            isLoading={isLoading || isLoadingDatasets}
            onSearchTextChange={setSearchText}
            searchBarPlaceholder="Search thoughts..."
            isShowingDetail={inspectorVisibility === "visible"}
            selectedItemId={selectedThoughtId ?? undefined}
            onSelectionChange={onSelectionChange}
            throttle
            searchBarAccessory={
                <List.Dropdown
                    tooltip="Filter Thoughts"
                    value={filter}
                    onChange={filter => {
                        setFilter(filter)

                        // if the filter is changed, we need to filter out the selections that are no longer visible

                        const newMassSelection = new Set(
                            Array.from(massSelection).filter(id => filteredThoughts?.some(thought => thought.id === id))
                        )
                        setMassSelection(newMassSelection)
                    }}
                >
                    <List.Dropdown.Item title="All" value="" />

                    <List.Dropdown.Section title="Status">
                        <List.Dropdown.Item title="Validated" value="validated-true" />
                        <List.Dropdown.Item title="Pending" value="validated-false" />
                    </List.Dropdown.Section>

                    {datasets && datasets.length > 0 && (
                        <List.Dropdown.Section title="Datasets">
                            {/* TODO: If dataset count grows too large, implement pagination or searching */}
                            {datasets
                                .filter(dataset => dataset.id && dataset.title)
                                .map(dataset => (
                                    <List.Dropdown.Item
                                        key={dataset.id}
                                        title={dataset.title}
                                        value={`dataset-${dataset.id}`}
                                    />
                                ))}
                        </List.Dropdown.Section>
                    )}
                </List.Dropdown>
            }
        >
            {filteredThoughts?.map(thought => (
                <ThoughtListItem
                    key={thought.id}
                    thought={thought}
                    inspectorVisibility={inspectorVisibility}
                    toggleInspector={() => setInspectorVisibility(inspectorVisibility === "visible" ? "hidden" : "visible")}
                    isSelected={selectedThoughtId === thought.id.toString()}
                    toggleValidation={toggleThoughtValidation}
                    onDelete={handleDeleteThought}
                    massThoughtDeletion={massThoughtDeletion}
                    onEdit={handleEditThought}
                    toggleRawMode={toggleRawMode}
                    toggleLargeTypeMode={toggleLargeTypeMode}
                    isRawMode={isRawMode}
                    isMassSelected={massSelection.has(thought.id.toString())}
                    isAllMassSelected={allThoughtsMassSelected}
                    massSelectionItems={massSelection}
                    handleMassSelectAll={handleMassSelectAll}
                    allThoughts={filteredThoughts}
                    toggleMassThoughtValidation={toggleMassThoughtValidation}
                    resetMassSelection={() => setMassSelection(new Set())}
                    toggleMassSelection={() => {
                        toggleSingleItemSelection(thought.id.toString())
                    }}
                    handleDragSelection={handleDragSelection}
                    handleGapSelection={handleGapSelection}
                    globalActions={globalActions}
                    createDataset={createDataset}
                    datasets={datasets}
                    isLoadingDatasets={isLoadingDatasets}
                />
            ))}
        </List>
    )
}
