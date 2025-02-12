/**
 *
 */

import { ActionPanel } from "@raycast/api"
import { SelectItemAction, SelectOptionAction } from "@sdkit/domains/raycast/actions"
import { useCapture } from "../components/context/provider"
import { ModifyActions } from "./modify"
import { SubmitActions } from "./submit"

export function CaptureActions(): JSX.Element {
    const captureContext = useCapture()

    return (
        <ActionPanel>
            <SubmitActions />
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
