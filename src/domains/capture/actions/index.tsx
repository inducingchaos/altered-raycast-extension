/**
 *
 */

import { ActionPanel } from "@raycast/api"
import { ModifyActions } from "./modify"
import { NavigateActions } from "./navigate"
import { SubmitActions } from "./submit"

export function CaptureActions(): JSX.Element {
    return (
        <ActionPanel>
            <SubmitActions />
            <ModifyActions />
            <NavigateActions />
        </ActionPanel>
    )
}
