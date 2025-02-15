/**
 *
 */

import { Action, Icon } from "@raycast/api"
import { navigateArray } from "@sdkit/utils"
import { SafeDataSchema } from "~/domains/shared/data"

export type SelectItemActionProps = {
    direction: "next" | "previous"
    schema: SafeDataSchema
    state: {
        selection: {
            id: string | undefined
            set: (id: string) => void
        }
    }
}

export function SelectItemAction({ direction, schema, state }: SelectItemActionProps): JSX.Element {
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
