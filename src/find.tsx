/**
 *
 */

import { Action, ActionPanel, List, Detail } from "@raycast/api"
import { useState, useMemo } from "react"
import { ThoughtListItem } from "./components/thought/ThoughtListItem"
import { useThoughts } from "./hooks/useThoughts"
import { isThoughtValidated, getThoughtAlias, FRONTEND_HIDDEN_FIELDS } from "./utils/thought"
import { useDatasets } from "./hooks/useDatasets"
import { Thought } from "./types/thought"

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
        handleEditThought,
        validateAllThoughts
    } = useThoughts(searchText)
    const { datasets, isLoading: isLoadingDatasets } = useDatasets()

    const onSelectionChange = (id: string | null) => {
        setSelectedThoughtId(id)
    }

    const toggleRawMode = () => {
        setIsRawMode(!isRawMode)
    }

    const toggleLargeTypeMode = () => {
        setIsLargeTypeMode(!isLargeTypeMode)
    }

    const [massSelection, setMassSelection] = useState<Set<string>>(new Set())

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
                    toggleValidation={thoughtToToggle => toggleThoughtValidation(thoughtToToggle)}
                    onDelete={() => handleDeleteThought(thought.id.toString())}
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
                    toggleMassSelection={() =>
                        setMassSelection(prev => {
                            const newSet = new Set(prev)
                            if (prev.has(thought.id.toString())) {
                                newSet.delete(thought.id.toString())
                            } else {
                                newSet.add(thought.id.toString())
                            }
                            return newSet
                        })
                    }
                    globalActions={globalActions}
                />
            ))}
        </List>
    )
}
