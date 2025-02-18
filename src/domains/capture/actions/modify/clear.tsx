/**
 *
 */

import { Action, Icon, showToast, Toast } from "@raycast/api"
import { useCapture } from "~/domains/capture/components/context"
import { CaptureContextState } from "../../components/context/state"

export function ClearAction({ scope }: { scope: "all" | "selection" }): JSX.Element {
    const { state } = useCapture()

    return (
        <Action
            style={Action.Style.Regular}
            title={scope === "selection" ? "Clear" : "Clear All"}
            icon={Icon.Trash}
            shortcut={{ modifiers: scope === "selection" ? ["cmd"] : ["shift", "cmd"], key: "x" }}
            onAction={() => handleClearAction({ scope, state })}
        />
    )
}

export async function handleClearAction({
    scope,
    state
}: {
    scope: "all" | "selection"
    state: CaptureContextState["state"]
}): Promise<void> {
    ;async () => {
        scope === "selection" ? state.content.reset() : state.store.reset()
        await showToast({
            title: scope === "selection" ? "Cleared Selection" : "Cleared Capture",
            message: `The ${scope === "selection" ? "selection" : "capture"} has been cleared.`,
            style: Toast.Style.Success
        })
    }
}
