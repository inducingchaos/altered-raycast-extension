import { Action, ActionPanel, Color, Icon, List, Toast, showToast } from "@raycast/api"
import { ThoughtListItemProps } from "../../types/thought"
import {
    ALWAYS_VISIBLE_METADATA,
    FRONTEND_HIDDEN_FIELDS,
    formatDate,
    formatSubtitle,
    getThoughtAlias,
    isThoughtValidated
} from "../../utils/thought"
import { ThoughtForm } from "./ThoughtForm"
import { parseStringToBoolean } from "../../hooks/useKv"

export function ThoughtListItem({
    thought,
    onDelete,
    massThoughtDeletion,
    toggleValidation,
    toggleMassThoughtValidation,
    onEdit,
    inspectorVisibility,
    toggleInspector,
    isSelected,
    toggleRawMode,
    toggleLargeTypeMode,
    isRawMode = false,
    isMassSelected,
    toggleMassSelection,
    massSelectionItems,
    handleMassSelectAll,
    isAllMassSelected,
    allThoughts,
    resetMassSelection,
    globalActions,
    createDataset,
    datasets,
    isLoadingDatasets,
    isLoadingThoughts,
    handleDragSelection,
    handleGapSelection,
    sharedActionPanel
}: ThoughtListItemProps) {
    const alias = getThoughtAlias(thought)
    const isValidated = isThoughtValidated(thought)

    // Determine if we're in any loading state (datasets or thoughts)
    const isLoading = isLoadingDatasets || isLoadingThoughts

    // Create a lookup map for dataset titles
    const datasetMap =
        datasets?.reduce(
            (acc, dataset) => {
                acc[dataset.id] = dataset.title
                return acc
            },
            {} as Record<string, string>
        ) || {}

    // Determine title and subtitle based on inspector visibility and selection state
    let title: string
    let subtitle: string | undefined

    const noAlias = alias === ""

    if (inspectorVisibility === "visible") {
        if (isSelected) {
            title = noAlias ? formatSubtitle(thought) : alias
            subtitle = undefined
        } else {
            title = ""
            subtitle = noAlias ? formatSubtitle(thought) : alias
        }
    } else {
        title = alias
        subtitle = formatSubtitle(thought)
    }

    // Create accessories that will only be shown when inspector is hidden
    const accessories =
        inspectorVisibility === "hidden"
            ? [
                  // Priority tag if set
                  ...(thought.priority
                      ? [
                            {
                                text: {
                                    value: `P${parseFloat(thought.priority)}`,
                                    color: Color.PrimaryText
                                },
                                tooltip: "Priority Level"
                            }
                        ]
                      : []),
                  // Sensitive indicator if set
                  ...(thought.sensitive && parseStringToBoolean(thought.sensitive)
                      ? [
                            {
                                icon: { source: Icon.EyeDisabled, tintColor: Color.SecondaryText },
                                tooltip: "Sensitive Content"
                            }
                        ]
                      : []),
                  // Dataset tags
                  ...(thought.datasets && thought.datasets.length > 0
                      ? (thought.datasets
                            .map(datasetId => {
                                // Get the dataset title if it exists in our map
                                const datasetTitle = datasetMap[datasetId]

                                // If we have the title, show it immediately regardless of loading state
                                if (datasetTitle) {
                                    return {
                                        tag: {
                                            value: datasetTitle,
                                            color: Color.SecondaryText
                                        },
                                        tooltip: "Dataset"
                                    }
                                }

                                // If loading datasets or thoughts, don't show invalid tags
                                if (isLoading) {
                                    return null
                                }

                                // If dataset doesn't exist and we're done loading, show as invalid
                                return {
                                    tag: {
                                        value: "Invalid Dataset",
                                        color: Color.Red
                                    },
                                    tooltip: `Invalid dataset ID: ${datasetId}`
                                }
                            })
                            .filter(item => item !== null) as List.Item.Accessory[])
                      : []),

                  // Creation date
                  {
                      date: new Date(thought.createdAt),
                      tooltip: "Created on"
                  },

                  // Validation status
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

    // Create a more consistent detail metadata panel
    const renderMetadataFields = () => {
        const metadataItems = []

        // Add Dev Notes at the top if present
        if (thought.devNotes) {
            metadataItems.push(
                <List.Item.Detail.Metadata.Label key="devNotes" title="Dev Notes" text={thought.devNotes} />,
                <List.Item.Detail.Metadata.Separator key="devNotes-sep" />
            )
        }

        // Add Priority if set
        if (thought.priority) {
            metadataItems.push(
                <List.Item.Detail.Metadata.Label key="priority" title="Priority" text={`P${parseFloat(thought.priority)}`} />,
                <List.Item.Detail.Metadata.Separator key="priority-sep" />
            )
        }

        // Add Sensitive status if set
        if (thought.sensitive) {
            metadataItems.push(
                <List.Item.Detail.Metadata.Label
                    key="sensitive"
                    title="Sensitive"
                    text={parseStringToBoolean(thought.sensitive) ? "Yes" : "No"}
                />,
                <List.Item.Detail.Metadata.Separator key="sensitive-sep" />
            )
        }

        // Always show important fields in consistent order
        for (const field of ALWAYS_VISIBLE_METADATA) {
            // Skip content as we will display it as markdown in the detail view
            if (field === "content") {
                continue
            } else if (field === "alias") {
                metadataItems.push(
                    <List.Item.Detail.Metadata.Label key="alias" title="Alias" text={alias} />,
                    <List.Item.Detail.Metadata.Separator key="alias-sep" />
                )
            } else if (field === "datasets") {
                const datasetsText =
                    thought.datasets && thought.datasets.length > 0
                        ? thought.datasets
                              .map(datasetId => {
                                  const datasetTitle = datasetMap[datasetId]
                                  // Show valid datasets immediately, only show placeholder for unknown datasets when loading
                                  return datasetTitle || (isLoading ? "..." : "Invalid Dataset")
                              })
                              .join(", ")
                        : "-"

                metadataItems.push(
                    <List.Item.Detail.Metadata.Label key="datasets" title="Datasets" text={datasetsText} />,
                    <List.Item.Detail.Metadata.Separator key="datasets-sep" />
                )
            } else if (field === "validated") {
                metadataItems.push(
                    <List.Item.Detail.Metadata.Label key="validated" title="Validated" text={isValidated ? "True" : "False"} />,
                    <List.Item.Detail.Metadata.Separator key="validated-sep" />
                )
            }
        }

        // Add any other custom properties
        const customProperties = Object.entries(thought).filter(
            ([key]) =>
                ![
                    "id",
                    "content",
                    "attachmentId",
                    "createdAt",
                    "updatedAt",
                    "alias",
                    "validated",
                    "datasets",
                    "userId",
                    "devNotes",
                    "priority",
                    "sensitive"
                ].includes(key) &&
                thought[key] !== null &&
                thought[key] !== undefined
        )

        customProperties.forEach(([key, value], index) => {
            metadataItems.push(
                <List.Item.Detail.Metadata.Label
                    key={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    text={String(value)}
                />
            )

            if (index < customProperties.length - 1) {
                metadataItems.push(<List.Item.Detail.Metadata.Separator key={`${key}-sep`} />)
            }
        })

        // Add separator before dates if we have custom properties
        if (customProperties.length > 0) {
            metadataItems.push(<List.Item.Detail.Metadata.Separator key="pre-dates-sep" />)
        }

        // Always add dates at the bottom
        metadataItems.push(
            <List.Item.Detail.Metadata.Label key="created" title="Created" text={formatDate(new Date(thought.createdAt))} />,
            <List.Item.Detail.Metadata.Separator key="created-sep" />,
            <List.Item.Detail.Metadata.Label key="updated" title="Updated" text={formatDate(new Date(thought.updatedAt))} />
        )

        return metadataItems
    }

    // Generate markdown for raw view
    const generateMarkdown = (): string => {
        const markdown = []

        // Content first - raw mode shows everything including content
        markdown.push(`# Content`)
        markdown.push(thought.content)
        markdown.push("")

        // Add Dev Notes prominently at the top if present
        if (thought.devNotes) {
            markdown.push("")
            markdown.push(`# Dev Notes`)
            markdown.push(`\`\`\`\n${thought.devNotes}\n\`\`\``)
            markdown.push("")
        }

        markdown.push("")
        markdown.push(`## Alias`)
        markdown.push(alias)
        markdown.push("")
        markdown.push("")
        markdown.push(`## Created`)
        markdown.push(formatDate(new Date(thought.createdAt)))
        markdown.push("")
        markdown.push("")
        markdown.push(`**${"`"}Updated${"`"}**  ${formatDate(new Date(thought.updatedAt))}`)
        markdown.push("")
        markdown.push("---")
        markdown.push(`**${"`"}Validated${"`"}**  ${isValidated ? "Yes" : "No"}`)
        markdown.push("")
        markdown.push("---")
        markdown.push(`**Datasets:**  ${thought.datasets ? "Yes" : "No"}`)
        markdown.push("")
        markdown.push("\n")
        markdown.push("")

        // Add Priority if set
        if (thought.priority) {
            markdown.push(`**Priority:** P${parseFloat(thought.priority)}`)
            markdown.push("")
        }

        // Add Sensitive status if set
        if (thought.sensitive) {
            markdown.push(`**Sensitive:** ${parseStringToBoolean(thought.sensitive) ? "Yes" : "No"}`)
            markdown.push("")
        }

        if (thought.datasets && thought.datasets.length > 0) {
            const datasetNames = thought.datasets
                .map(datasetId => {
                    const datasetTitle = datasetMap[datasetId]
                    // Show valid datasets immediately, only show placeholder for unknown datasets when loading
                    return datasetTitle || (isLoading ? "..." : "Invalid Dataset")
                })
                .join(", ")
            markdown.push(`**Datasets:** ${datasetNames}`)
        } else {
            markdown.push(`**Datasets:** -`)
        }
        markdown.push("")

        // Add any custom properties
        Object.entries(thought).forEach(([key, value]) => {
            if (
                !FRONTEND_HIDDEN_FIELDS.includes(key) &&
                !["content", "alias", "validated", "datasets", "devNotes", "priority"].includes(key) &&
                value !== null &&
                value !== undefined
            ) {
                markdown.push(`**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`)
                markdown.push("")
            }
        })

        return markdown.join("\n")
    }

    // Handle deletion (both single item and mass selection)
    const handleDelete = () => {
        // If there are selected items and this one is selected, handle mass deletion
        if (massSelectionItems.size > 0 && allThoughts) {
            handleMassDelete()
        } else {
            // Otherwise, just delete this thought
            onDelete(thought.id)
        }
    }

    // Force delete bypasses any confirmation
    const handleForceDelete = () => {
        // If there are selected items and this one is selected, handle mass deletion
        if (massSelectionItems.size > 0 && allThoughts) {
            // Find all the relevant thoughts for mass deletion
            const selectedThoughts = allThoughts?.filter(t => massSelectionItems.has(t.id.toString())) || []

            if (selectedThoughts.length === 0) {
                showToast({
                    style: Toast.Style.Failure,
                    title: "No thoughts selected",
                    message: "Select at least one thought to delete"
                })
                return
            }

            // Call massThoughtDeletion with true as second argument to bypass confirmation
            massThoughtDeletion(selectedThoughts, true)
        } else {
            // Pass true as second argument to bypass confirmation for single thought deletion
            onDelete(thought.id, true)
        }
    }

    // Handle mass deletion
    const handleMassDelete = () => {
        // Find all the relevant thoughts for mass deletion
        const selectedThoughts = allThoughts?.filter(t => massSelectionItems.has(t.id.toString())) || []

        if (selectedThoughts.length === 0) {
            showToast({
                style: Toast.Style.Failure,
                title: "No thoughts selected",
                message: "Select at least one thought to delete"
            })
            return
        }

        // Call massThoughtDeletion directly - no confirmation here as it will happen in the parent
        massThoughtDeletion(selectedThoughts)
        // Don't reset selection here - let the parent handle it after confirmation
    }

    // Handle mass validation/invalidation
    const handleValidation = () => {
        // If there are selected items and this one is selected
        if (massSelectionItems.size > 0 && toggleMassThoughtValidation && allThoughts) {
            // First, determine if we should validate or invalidate
            // If ANY selected thought is validated, prefer invalidation
            const selectedThoughtIds = Array.from(massSelectionItems)

            // Check if any of the selected thoughts are validated
            let anyValidated = false

            if (allThoughts) {
                // Check if any of the selected thoughts are validated
                anyValidated = allThoughts.some(t => selectedThoughtIds.includes(t.id.toString()) && isThoughtValidated(t))
            } else {
                throw new Error("All thoughts are not available")
            }

            // The target validation state (what we WANT to set things to)
            const targetValidationState = anyValidated ? "false" : "true"

            // Get the actual thought objects for all selected thoughts
            const selectedThoughts = allThoughts.filter(t => selectedThoughtIds.includes(t.id.toString()))

            // Use the mass validation function to update all thoughts at once
            toggleMassThoughtValidation(selectedThoughts, targetValidationState)

            // Reset mass selection immediately after initiating the validation
            resetMassSelection()
            return
        }

        // Otherwise, just toggle validation for this thought
        toggleValidation(thought)
    }

    // Determine validation action title
    const getValidationActionTitle = () => {
        if (massSelectionItems.size > 0 && isMassSelected) {
            // For mass action, determine if any selected items are validated
            let anyValidated = false

            if (allThoughts) {
                // Check entire thoughts list
                const selectedThoughtIds = Array.from(massSelectionItems)
                anyValidated = allThoughts.some(t => selectedThoughtIds.includes(t.id.toString()) && isThoughtValidated(t))
            } else {
                throw new Error("All thoughts are not available")
            }

            return anyValidated ? "Invalidate Selected" : "Validate Selected"
        }

        // Single item validation
        return isValidated ? "Invalidate Thought" : "Validate Thought"
    }

    return (
        <List.Item
            id={thought.id.toString()}
            title={title}
            subtitle={subtitle}
            accessories={accessories}
            detail={
                isRawMode ? (
                    <List.Item.Detail markdown={generateMarkdown()} />
                ) : (
                    <List.Item.Detail
                        markdown={thought.content}
                        metadata={<List.Item.Detail.Metadata>{renderMetadataFields()}</List.Item.Detail.Metadata>}
                    />
                )
            }
            icon={
                massSelectionItems.size > 0
                    ? isMassSelected
                        ? { source: Icon.CheckCircle, tintColor: Color.SecondaryText }
                        : { source: Icon.Circle, tintColor: Color.SecondaryText }
                    : undefined
            }
            actions={
                <ActionPanel>
                    <Action.CopyToClipboard
                        title="Copy Content"
                        content={thought.content}
                        shortcut={{ modifiers: ["cmd"], key: "." }}
                    />
                    {globalActions && (
                        <Action
                            title="Deselect All"
                            icon={Icon.XMarkCircle}
                            shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                            onAction={resetMassSelection}
                        />
                    )}
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
                        target={
                            <ThoughtForm
                                thought={thought}
                                onSubmit={fields => onEdit(thought, fields)}
                                createDataset={createDataset}
                                datasets={datasets}
                                isLoadingDatasets={isLoadingDatasets}
                            />
                        }
                    />

                    <Action
                        title={isMassSelected ? "Deselect Thought" : "Select Thought"}
                        icon={isMassSelected ? Icon.XMarkCircle : Icon.CheckCircle}
                        shortcut={{ modifiers: ["cmd"], key: "s" }}
                        onAction={toggleMassSelection}
                    />

                    {/* Update titles and descriptions for drag actions */}
                    <Action
                        title={massSelectionItems.size > 0 ? "Select Next Thought" : "Move Thought Down"}
                        icon={Icon.ArrowDown}
                        shortcut={{ modifiers: ["shift"], key: "arrowDown" }}
                        onAction={() => handleDragSelection?.("down")}
                    />

                    <Action
                        title={massSelectionItems.size > 0 ? "Select Previous Thought" : "Move Thought Up"}
                        icon={Icon.ArrowUp}
                        shortcut={{ modifiers: ["shift"], key: "arrowUp" }}
                        onAction={() => handleDragSelection?.("up")}
                    />

                    <Action
                        title={isAllMassSelected ? "Deselect All" : "Select All"}
                        icon={isAllMassSelected ? Icon.XMarkCircle : Icon.CheckCircle}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
                        onAction={handleMassSelectAll}
                    />

                    {/* Gap selection action */}
                    <Action
                        title="Select Gap"
                        icon={Icon.List}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
                        onAction={handleGapSelection}
                    />

                    {inspectorVisibility === "visible" && (
                        <>
                            <Action
                                title={isRawMode ? "Switch to Metadata View" : "Switch to Raw View"}
                                icon={Icon.Text}
                                shortcut={{ modifiers: ["opt"], key: "r" }}
                                onAction={toggleRawMode}
                            />
                            {toggleLargeTypeMode && (
                                <Action
                                    title="Large Type Mode"
                                    icon={Icon.Maximize}
                                    shortcut={{ modifiers: ["opt"], key: "l" }}
                                    onAction={toggleLargeTypeMode}
                                />
                            )}
                        </>
                    )}
                    {sharedActionPanel}
                    <Action
                        title={getValidationActionTitle()}
                        icon={isValidated ? Icon.XMarkCircle : Icon.CheckCircle}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "v" }}
                        onAction={handleValidation}
                    />
                    <Action
                        title={massSelectionItems.size > 0 && isMassSelected ? "Delete Selected" : "Delete Thought"}
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                        onAction={handleDelete}
                    />
                    <Action
                        title={massSelectionItems.size > 0 && isMassSelected ? "Force Delete Selected" : "Force Delete Thought"}
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "backspace" }}
                        onAction={handleForceDelete}
                    />
                </ActionPanel>
            }
        />
    )
}
