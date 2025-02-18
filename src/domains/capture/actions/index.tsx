/**
 *
 */

import { Action, ActionPanel, Icon } from "@raycast/api"
import { SelectItemAction, SelectOptionAction } from "./navigation"
import { useCapture } from "../components/context"
import { SubmitActions } from "./submit"
import { ClearAction, CopyAction } from "./modify"

export function CaptureActions(): JSX.Element {
    const captureContext = useCapture()

    return (
        <ActionPanel>
            <SubmitActions />
            <ActionPanel.Section title="View">
                <Action
                    title="Inspect"
                    icon={Icon.Eye}
                    shortcut={{ modifiers: ["cmd"], key: "i" }}
                    onAction={() => captureContext.state.view.inspector.toggle()}
                />
            </ActionPanel.Section>

            <ActionPanel.Section title="Modify">
                <CopyAction scope="selection" />
                <CopyAction scope="all" />
                <ClearAction scope="selection" />
                <ClearAction scope="all" />
            </ActionPanel.Section>
            <ActionPanel.Section title="Navigate">
                <SelectItemAction direction="next" />
                <SelectItemAction direction="previous" />
                <SelectOptionAction direction="next" />
                <SelectOptionAction direction="previous" />
            </ActionPanel.Section>
        </ActionPanel>
    )
}
