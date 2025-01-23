/**
 *
 */

import { Action, ActionPanel, Icon } from "@raycast/api"

export function ModifyActions(): JSX.Element {
    return (
        <ActionPanel.Section title="Modify">
            <Action
                title="Clear All"
                icon={Icon.Trash}
                shortcut={{ modifiers: ["cmd"], key: "n" }}
                onAction={() => console.log("Clear All")}
            />
        </ActionPanel.Section>
    )
}
