/**
 *
 */

import { Action, Icon } from "@raycast/api"
import { navigateArray } from "@sdkit/utils"
import { useCapture } from "~/domains/capture/components/context"

export function SelectItemAction({ direction }: { direction: "next" | "previous" }): JSX.Element {
    const { state, schema } = useCapture()

    return (
        <Action
            title={direction === "next" ? "Next" : "Previous"}
            icon={direction === "next" ? Icon.ArrowRight : Icon.ArrowLeft}
            shortcut={{ modifiers: direction === "next" ? [] : ["shift"], key: "tab" }}
            onAction={() =>
                state.selection.set(
                    navigateArray({
                        source: schema.columns,
                        current: ({ id }) => id === state.selection.id,
                        direction
                    }).id
                )
            }
        />
    )
}
