/**
 *
 */

import { Action, Clipboard, Icon, Toast, showToast } from "@raycast/api"
import { useCapture } from "~/domains/capture/components/context"
import { CaptureContextState } from "../../components/context/state"

export function CopyAction({ items }: { items: "all" | "selected" }): JSX.Element {
    const { state, columns } = useCapture()

    return (
        <Action
            title={items === "selected" ? "Copy Selection" : "Copy Thought"}
            icon={items === "selected" ? Icon.ShortParagraph : Icon.Paragraph}
            shortcut={{ modifiers: items === "selected" ? ["cmd"] : ["shift", "cmd"], key: "c" }}
            onAction={async () => handleCopy({ items, state, columns })}
        />
    )
}

export async function handleCopy({
    items,
    state,
    columns
}: {
    items: "all" | "selected"
    state: CaptureContextState["state"]
    columns: CaptureContextState["columns"]
}): Promise<void> {
    const content =
        items === "selected"
            ? state.content.value
            : Array.from(state.store.value.entries()).reduce((acc, [key, { value }], index, arr) => {
                  return (
                      acc +
                      `${columns.find(column => column.id === key)?.name}: ${value}${index !== arr.length - 1 ? "\n" : ""}`
                  )
              }, "")

    await Clipboard.copy(content)

    await showToast({
        title: items === "selected" ? `Copied Selection` : "Copied Thought",
        message: `The ${items === "selected" ? "selection" : "thought"} was copied to clipboard.`,
        style: Toast.Style.Success
    })
}
