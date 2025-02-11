/**
 *
 */

import { Action, Icon } from "@raycast/api"
import { FormItem } from "@sdkit/domains/raycast/meta"
import { navigateArray } from "@sdkit/utils"
import { Dispatch } from "react"
import { DataStore } from "~/domains/capture/types"
import { SerializableDataColumn } from "~/domains/shared/data/definitions"

export type SelectOptionActionProps = {
    direction: "next" | "previous"
    schema: { items: FormItem[] }
    state: {
        store: {
            value: DataStore
            set: (value: DataStore) => void
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
            onAction={() => 
                
                state.store.set(prev => prev.set(
                    
                )

                )
                selectOption({ direction, schema, state })}
        />
    )
}

const selectOption = ({ direction, schema, state }: SelectOptionActionProps) => {
    //  Get the type, so we can get the options, and get possible options off schema

    const { options } = schema.items.find(item => item.id === state.selection.id)

    navigateArray({
        source: schema.items,
        current: ({ id }) => id === state.selection.id,
        direction
    })
    selectOption({
        inDirection: "next",
        columns,
        dataStore,
        setDataStore,
        selectedItemId: state.selection.id
    })
}

function navigateMap<Item>({
    source,
    current,
    direction
}: {
    inDirection: "next" | "previous"
    columns: SerializableDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
    selectedItemId: string | undefined
}) {
    if (columns.find(column => column.id === selectedItemId)?.type !== "boolean") return

    if (!selectedItemId) return

    const currentValue = dataStore.get(selectedItemId)?.value
    const nextValue =
        inDirection === "next"
            ? currentValue?.toLowerCase() === "true"
                ? "False"
                : "True"
            : currentValue?.toLowerCase() === "false"
              ? "True"
              : "False"

    setDataStore(prev => new Map(prev).set(selectedItemId, { value: nextValue, errors: [] }))
}
