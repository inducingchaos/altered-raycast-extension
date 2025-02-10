/**
 *
 */

import { Action, Icon } from "@raycast/api"
// import { FormSchema } from "@sdkit/domains/raycast/meta"

export type SelectListItemActionProps = {
    direction: "next" | "previous"
    schema: { items: { id: string }[] }
    state: {
        selection: {
            id: string | undefined
            set: (id: string) => void
        }
    }
}

// should be done in the setter

// onSelectionChange({
//     selectedItemIdUpdatedAt,
//     selectedItemId: rows[nextIndex]?.id,
//     setSelectedItemId
// })

function selectListItem({ direction, schema, state }: SelectListItemActionProps): void {
    const currentIndex = schema.items.findIndex(item => item.id === state.selection.id)
    const offset = direction === "next" ? 1 : -1 + schema.items.length
    const nextIndex = (currentIndex + offset) % schema.items.length

    state.selection.set(schema.items[nextIndex].id!)
}

export function SelectListItemAction({ direction, schema, state }: SelectListItemActionProps): JSX.Element {
    return (
        <Action
            title={direction === "next" ? "Next" : "Previous"}
            icon={direction === "next" ? Icon.ArrowRight : Icon.ArrowLeft}
            shortcut={{ modifiers: direction === "next" ? [] : ["shift"], key: "tab" }}
            onAction={() => selectListItem({ direction, schema, state })}
        />
    )
}
