/**
 *
 */

import { Action, Icon } from "@raycast/api"
import { DataStore } from "~/domains/capture/types"
import { SafeDataSchema } from "~/domains/shared/data"

export type SelectOptionActionProps = {
    direction: "next" | "previous"
    schema: SafeDataSchema
    state: {
        store: {
            value: DataStore
            set: (value: (prev: DataStore) => DataStore) => void
        }
        selection: {
            id: string | undefined
        }
    }
}

export function SelectOptionAction({ direction, schema, state }: SelectOptionActionProps): JSX.Element {
    return (
        <Action
            title={direction === "next" ? "Next Option" : "Previous Option"}
            icon={direction === "next" ? Icon.ArrowRightCircle : Icon.ArrowLeftCircle}
            shortcut={{ modifiers: direction === "next" ? ["ctrl"] : ["shift", "ctrl"], key: "tab" }}
            onAction={() => oldSelectOption({ direction, schema, state })}
        />
    )
}

// const selectOption = ({ direction, schema, state }: SelectOptionActionProps) => {
//     //  Get the type, so we can get the options, and get possible options off schema

//     const { options } = schema.items.find(item => item.id === state.selection.id)

//     navigateArray({
//         source: schema.items,
//         current: ({ id }) => id === state.selection.id,
//         direction
//     })
//     selectOption({
//         inDirection: "next",
//         columns,
//         dataStore,
//         setDataStore,
//         selectedItemId: state.selection.id
//     })
// }

function oldSelectOption({
    direction,
    schema,
    state: {
        store,
        selection: { id: selectionId }
    }
}: SelectOptionActionProps) {
    if (schema.columns.find(column => column.id === selectionId)?.type !== "boolean") return

    if (!selectionId) return

    // logic for just boolean - replace with dynamic

    const currentValue = store.value.get(selectionId)?.value
    const nextValue =
        direction === "next"
            ? currentValue?.toLowerCase() === "true"
                ? "False"
                : "True"
            : currentValue?.toLowerCase() === "false"
              ? "True"
              : "False"

    store.set(prev => prev.set(selectionId, { value: nextValue, errors: [] }))
}
