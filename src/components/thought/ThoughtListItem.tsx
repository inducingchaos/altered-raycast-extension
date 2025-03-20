import { Action, ActionPanel, Color, Icon, List } from "@raycast/api"
import { ThoughtListItemProps } from "../../types/thought"
import { formatDate, formatDetailDate, formatSubtitle, getThoughtAlias, isThoughtValidated } from "../../utils/thought"
import { ThoughtForm } from "./ThoughtForm"

export function ThoughtListItem({
    thought,
    onDelete,
    toggleValidation,
    onEdit,
    inspectorVisibility,
    toggleInspector,
    isSelected
}: ThoughtListItemProps) {
    const alias = getThoughtAlias(thought)
    const isValidated = isThoughtValidated(thought)

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
                  {
                      date: new Date(thought.createdAt),
                      tooltip: "Created on"
                  },
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
                            <List.Item.Detail.Metadata.Label
                                title="Created At"
                                text={formatDetailDate(new Date(thought.createdAt))}
                            />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label
                                title="Updated At"
                                text={formatDate(new Date(thought.updatedAt))}
                            />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="Validated" text={isValidated ? "true" : "false"} />
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
                        shortcut={{ modifiers: ["opt"], key: "e" }}
                        target={<ThoughtForm thought={thought} onSubmit={fields => onEdit(thought, fields)} />}
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
