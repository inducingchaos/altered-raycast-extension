/**
 *
 */

import { Action, Icon } from "@raycast/api"
import { HFRow, HFSchema } from "../../definitions"

export type HFSelectRowActionProps = {
    direction: "next" | "previous"
    schema: HFSchema
    state: {
        selectedRow: {
            id: string
            updatedAt: number
            set: (id: string) => void
        }
    }
}

export function HFSelectRowAction({ direction, schema, state }: HFSelectRowActionProps): JSX.Element {
    return (
        <Action
            title={direction === "next" ? "Next" : "Previous"}
            icon={direction === "next" ? Icon.ArrowRight : Icon.ArrowLeft}
            shortcut={{ modifiers: [], key: "tab" }}
            onAction={() => {
                hfSelectRow({ inDirection: direction, schema, state })
            }}
        />
    )
}

export function hfSelectRow({ direction, schema, state }: HFSelectRowActionProps): void {
    const currentIndex = schema.rows.findIndex(row => row.id === state.selectedRow.id)
    const nextIndex = (currentIndex + 1) % schema.rows.length

    onSelectionChange({
        selectedItemIdUpdatedAt,
        selectedItemId: rows[nextIndex]?.id,
        setSelectedItemId
    })
}
