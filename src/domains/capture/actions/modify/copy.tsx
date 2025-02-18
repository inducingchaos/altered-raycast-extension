/**
 * @validation: MG
 */

import { Action, Clipboard, Icon, Toast, showToast } from "@raycast/api"
import { useCapture } from "~/domains/capture/components/context"
import { CaptureContextState } from "../../components/context/state"

export async function handleCopyAction({
    scope,
    state,
    columns
}: {
    scope: "all" | "selection"
    state: CaptureContextState["state"]
    columns: CaptureContextState["columns"]
}): Promise<void> {
    const content =
        scope === "selection"
            ? state.content.value
            : Array.from(state.store.value.entries()).reduce((acc, [key, { value }], index, arr) => {
                  return (
                      acc +
                      `${columns.find(column => column.id === key)?.name}: ${value}${index !== arr.length - 1 ? "\n" : ""}`
                  )
              }, "")

    await Clipboard.copy(content)

    await showToast({
        title: scope === "selection" ? `Copied Selection` : "Copied Capture",
        message: `The ${scope === "selection" ? "selection" : "capture"} was copied to clipboard.`,
        style: Toast.Style.Success
    })
}

export function CopyAction({ scope }: { scope: "selection" | "all" }): JSX.Element {
    const { state, columns } = useCapture()

    return (
        <Action
            title={scope === "selection" ? "Copy" : "Copy All"}
            icon={Icon.Clipboard}
            shortcut={{ modifiers: scope === "selection" ? ["cmd"] : ["shift", "cmd"], key: "c" }}
            onAction={async () => handleCopyAction({ scope, state, columns })}
        />
    )
}
