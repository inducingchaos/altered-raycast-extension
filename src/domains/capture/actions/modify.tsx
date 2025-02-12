/**
 * @todo Extract actions out to SDKit.
 */

import { Action, ActionPanel, Icon } from "@raycast/api"
import { useCapture } from "../components/context/provider"

export function ModifyActions(): JSX.Element {
    const { setDataStore } = useCapture()

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
