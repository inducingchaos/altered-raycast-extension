/**
 *
 */

import { Action, ActionPanel, Icon } from "@raycast/api"
import { SelectItemAction, SelectOptionAction } from "@sdkit/domains/raycast/actions"
import { useCapture } from "../components/context"
import { ModifyActions } from "./modify"
import { SubmitActions } from "./submit"

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
            <ModifyActions />
            <ActionPanel.Section title="Navigate">
                <SelectItemAction direction="next" {...captureContext} />
                <SelectItemAction direction="previous" {...captureContext} />
                <SelectOptionAction direction="next" {...captureContext} />
                <SelectOptionAction direction="previous" {...captureContext} />
            </ActionPanel.Section>
        </ActionPanel>
    )
}
