/**
 * @validation: MG
 */

import { Action, Icon, showToast, Toast } from "@raycast/api"
import { useCapture } from "~/domains/capture/components/context"
import { CaptureContextState } from "../../components/context/state"

async function handleClearAction({
    scope,
    state
}: {
    scope: "all" | "selection"
    state: CaptureContextState["state"]
}): Promise<void> {
    scope === "selection" ? state.content.reset() : state.store.reset()

    await showToast({
        title: scope === "selection" ? "Cleared Selection" : "Cleared Capture",
        message: `The ${scope === "selection" ? "selection" : "capture"} has been cleared.`,
        style: Toast.Style.Success
    })
}

export function ClearAction({ scope }: { scope: "all" | "selection" }): JSX.Element {
    const { state } = useCapture()

    return (
        <Action
            title={scope === "selection" ? "Clear" : "Clear All"}
            icon={Icon.Trash}
            shortcut={{ modifiers: scope === "selection" ? ["cmd"] : ["shift", "cmd"], key: "x" }}
            onAction={() => handleClearAction({ scope, state })}
        />
    )
}
