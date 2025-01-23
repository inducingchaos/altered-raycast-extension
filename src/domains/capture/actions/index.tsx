/**
 *
 */

import { ActionPanel } from "@raycast/api"
import { ModifyActions } from "./modify"
import { SubmitActions } from "./submit"

export function CaptureActions(): JSX.Element {
    return (
        <ActionPanel>
            <SubmitActions />
            <ModifyActions />
        </ActionPanel>
    )
}
