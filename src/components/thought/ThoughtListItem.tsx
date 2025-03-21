import { Action, ActionPanel, Color, Icon, List } from "@raycast/api"
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
import { useDatasets } from "../../hooks/useDatasets"

export function ThoughtListItem({
    thought,
    onDelete,
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
    allThoughts
}: ThoughtListItemProps) {
    const alias = getThoughtAlias(thought)
    const isValidated = isThoughtValidated(thought)
    const { datasets } = useDatasets()

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

    if (inspectorVisibility === "visible") {
        if (isSelected) {
            title = alias
            subtitle = undefined
        } else {
            title = ""
            subtitle = alias
        }
    } else {
        title = alias
        subtitle = formatSubtitle(thought)
    }

    // Create accessories that will only be shown when inspector is hidden
    const accessories =
        inspectorVisibility === "hidden"
            ? [
                  // Dataset tags
                  ...(thought.datasets && thought.datasets.length > 0
                      ? thought.datasets.map(datasetId => ({
                            tag: {
                                value: datasetMap[datasetId] || datasetId,
                                color: Color.SecondaryText
                            },
                            tooltip: "Dataset"
                        }))
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

        // Always show important fields in consistent order
        for (const field of ALWAYS_VISIBLE_METADATA) {
            if (field === "content") {
                metadataItems.push(
                    <List.Item.Detail.Metadata.Label key="content" title="Content" text={thought.content} />,
                    <List.Item.Detail.Metadata.Separator key="content-sep" />
                )
            } else if (field === "alias") {
                metadataItems.push(
                    <List.Item.Detail.Metadata.Label key="alias" title="Alias" text={alias} />,
                    <List.Item.Detail.Metadata.Separator key="alias-sep" />
                )
            } else if (field === "datasets") {
                const datasetsText =
                    thought.datasets && thought.datasets.length > 0
                        ? thought.datasets.map(datasetId => datasetMap[datasetId] || datasetId).join(", ")
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
                    "userId"
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

        // Content first
        markdown.push(`# Content`)
        markdown.push(thought.content)
        markdown.push("")
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

        // // Content first
        // markdown.push(`**${"`"}Content${"`"}**  ${thought.content}`)
        // markdown.push("")
        // markdown.push("---")
        // markdown.push(`**${"`"}Alias${"`"}**  ${alias}`)
        // markdown.push("")
        // markdown.push("---")
        // markdown.push(`**${"`"}Created${"`"}**  ${formatDate(new Date(thought.createdAt))}`)
        // markdown.push("")
        // markdown.push("---")
        // markdown.push(`**${"`"}Updated${"`"}**  ${formatDate(new Date(thought.updatedAt))}`)
        // markdown.push("")
        // markdown.push("---")
        // markdown.push(`**${"`"}Validated${"`"}**  ${isValidated ? "Yes" : "No"}`)
        // markdown.push("")

        if (thought.datasets && thought.datasets.length > 0) {
            const datasetNames = thought.datasets.map(datasetId => datasetMap[datasetId] || datasetId).join(", ")
            markdown.push(`**Datasets:** ${datasetNames}`)
        } else {
            markdown.push(`**Datasets:** -`)
        }
        markdown.push("")

        // Add any custom properties
        Object.entries(thought).forEach(([key, value]) => {
            if (
                !FRONTEND_HIDDEN_FIELDS.includes(key) &&
                !["content", "alias", "validated", "datasets"].includes(key) &&
                value !== null &&
                value !== undefined
            ) {
                markdown.push(`**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`)
                markdown.push("")
            }
        })

        return markdown.join("\n")
    }

    // Handle mass deletion
    const handleDelete = () => {
        // If there are selected items and this one is selected, handle mass deletion
        if (massSelectionItems.size > 0 && isMassSelected) {
            const selectedIds = Array.from(massSelectionItems)
            // Call onDelete for each selected item as a batch operation
            Promise.all(selectedIds.map(id => onDelete(id)))
            return
        }

        // Otherwise, just delete this thought
        onDelete(thought.id)
    }

    // Handle mass validation/invalidation
    const handleValidation = () => {
        // If there are selected items and this one is selected
        if (massSelectionItems.size > 0 && isMassSelected && toggleMassThoughtValidation && allThoughts) {
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
                    <Action
                        title={`${inspectorVisibility === "visible" ? "Hide" : "Show"} Inspector`}
                        icon={inspectorVisibility === "visible" ? Icon.EyeDisabled : Icon.Eye}
                        shortcut={{ modifiers: ["cmd"], key: "i" }}
                        onAction={toggleInspector}
                    />
                    <Action.Push
                        title="Edit Thought"
                        icon={Icon.Pencil}
                        shortcut={{ modifiers: ["opt"], key: "e" }}
                        target={<ThoughtForm thought={thought} onSubmit={fields => onEdit(thought, fields)} />}
                    />
                    <Action
                        title={isMassSelected ? "Deselect Thought" : "Select Thought"}
                        icon={isMassSelected ? Icon.XMarkCircle : Icon.CheckCircle}
                        shortcut={{ modifiers: ["ctrl"], key: "s" }}
                        onAction={toggleMassSelection}
                    />
                    <Action
                        title={isAllMassSelected ? "Deselect All" : "Select All"}
                        icon={isAllMassSelected ? Icon.XMarkCircle : Icon.CheckCircle}
                        shortcut={{ modifiers: ["ctrl", "shift"], key: "s" }}
                        onAction={handleMassSelectAll}
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
                    <Action
                        title={getValidationActionTitle()}
                        icon={isValidated ? Icon.XMarkCircle : Icon.CheckCircle}
                        shortcut={{ modifiers: ["opt"], key: "v" }}
                        onAction={handleValidation}
                    />
                    <Action
                        title={massSelectionItems.size > 0 && isMassSelected ? "Delete Selected" : "Delete Thought"}
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
