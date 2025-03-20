/**
 *
 */

import { Action, ActionPanel, List, showToast, Toast, Detail } from "@raycast/api"
import { useState, useMemo } from "react"
import { ThoughtListItem } from "./components/thought/ThoughtListItem"
import { useThoughts } from "./hooks/useThoughts"
import { isThoughtValidated, getThoughtAlias, FRONTEND_HIDDEN_FIELDS } from "./utils/thought"
import { useDatasets } from "./hooks/useDatasets"
import { Thought } from "./types/thought"

export default function Find() {
    const [searchText, setSearchText] = useState("")
    const [inspectorVisibility, setInspectorVisibility] = useState<"visible" | "hidden">("visible")
    const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(null)
    const [isRawMode, setIsRawMode] = useState(false)
    const [isLargeTypeMode, setIsLargeTypeMode] = useState(false)
    const [filter, setFilter] = useState<string>("")

    const { thoughts, isLoading, handleDeleteThought, toggleThoughtValidation, handleEditThought } = useThoughts(searchText)
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

    // Function to validate all visible thoughts
    const validateAllThoughts = async () => {
        try {
            // Filter thoughts that are not already validated
            const thoughtsToValidate = filteredThoughts?.filter(thought => !isThoughtValidated(thought)) || []

            if (thoughtsToValidate.length === 0) {
                showToast({
                    style: Toast.Style.Success,
                    title: "Nothing to validate",
                    message: "All thoughts are already validated"
                })
                return
            }

            // Show progress toast
            const toast = await showToast({
                style: Toast.Style.Animated,
                title: "Validating thoughts",
                message: `Validating ${thoughtsToValidate.length} thoughts...`
            })

            // Use Promise.all to perform all validations in parallel
            const validationPromises = thoughtsToValidate.map(thought => toggleThoughtValidation(thought))

            await Promise.all(validationPromises)
                .then(() => {
                    toast.style = Toast.Style.Success
                    toast.title = "All thoughts validated"
                    toast.message = `Successfully validated ${thoughtsToValidate.length} thoughts`
                })
                .catch(error => {
                    toast.style = Toast.Style.Failure
                    toast.title = "Validation partially failed"
                    toast.message = error instanceof Error ? error.message : String(error)
                })
        } catch (error) {
            console.error("Error validating all thoughts:", error)
            showToast({
                style: Toast.Style.Failure,
                title: "Error",
                message: "Failed to validate thoughts"
            })
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
                <List.Dropdown tooltip="Filter Thoughts" value={filter} onChange={setFilter}>
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
            actions={
                <ActionPanel>
                    <Action
                        title="Validate All Visible Thoughts"
                        shortcut={{ modifiers: ["cmd"], key: "v" }}
                        onAction={validateAllThoughts}
                    />
                    {selectedThoughtId && (
                        <>
                            <Action
                                title={isRawMode ? "Switch to Metadata View" : "Switch to Raw View"}
                                shortcut={{ modifiers: ["opt"], key: "r" }}
                                onAction={toggleRawMode}
                            />
                            <Action
                                title="Large Type Mode"
                                shortcut={{ modifiers: ["opt"], key: "l" }}
                                onAction={toggleLargeTypeMode}
                            />
                        </>
                    )}
                </ActionPanel>
            }
        >
            {filteredThoughts?.map(thought => (
                <ThoughtListItem
                    key={thought.id}
                    thought={thought}
                    inspectorVisibility={inspectorVisibility}
                    toggleInspector={() => setInspectorVisibility(inspectorVisibility === "visible" ? "hidden" : "visible")}
                    isSelected={selectedThoughtId === thought.id.toString()}
                    toggleValidation={() => toggleThoughtValidation(thought)}
                    onDelete={() => handleDeleteThought(thought.id.toString())}
                    onEdit={handleEditThought}
                    toggleRawMode={toggleRawMode}
                    toggleLargeTypeMode={toggleLargeTypeMode}
                    isRawMode={isRawMode}
                />
            ))}
        </List>
    )
}
