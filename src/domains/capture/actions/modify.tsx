/**
 *
 */

import { Action, ActionPanel, Icon } from "@raycast/api"
import { useCaptureList } from "../components/provider"

export function ModifyActions(): JSX.Element {
    const { setDataStore } = useCaptureList()

    return (
        <ActionPanel.Section title="Modify">
            <Action
                title="Clear All"
                icon={Icon.Trash}
                shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
                onAction={() => {
                    setDataStore(new Map())
                }}
            />
        </ActionPanel.Section>
    )
}
