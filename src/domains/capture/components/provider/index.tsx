/**
 *
 */

"use client"

import { useMemo, useRef, useState, type JSX } from "react"
import { DataStore } from "../../types"
import { CaptureContext } from "./context"
import type { CaptureContextProviderProps } from "./types"
import { onSelectionChange } from "../../handlers"

export function CaptureContextProvider({ config, children }: CaptureContextProviderProps): JSX.Element {
    const [dataStore, setDataStore] = useState<DataStore>(new Map())
    const dataStoreUpdatedAt = useRef<number | undefined>()

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const selectedItemIdUpdatedAt = useRef<number | undefined>()

    const columns = config.schema.columns
    const selectedColumn = columns.find(column => column.id === selectedItemId)

    const searchText = (selectedItemId && dataStore.get(selectedItemId)?.value) ?? ""
    const searchBarPlaceholder = `${
        (selectedColumn?.description?.endsWith(".") ? selectedColumn.description.slice(0, -1) : selectedColumn?.description) ??
        "Loading"
    }...`

    const schema = {
        items: columns
    }

    const state = useMemo(
        () => ({
            selection: {
                id: selectedItemId,
                updatedAt: selectedItemIdUpdatedAt.current,
                set: (id: string | undefined) =>
                    onSelectionChange({ selectedItemId: id ?? null, setSelectedItemId, selectedItemIdUpdatedAt })
            }
        }),
        [selectedItemId]
    )

    return (
        <CaptureContext.Provider
            value={{
                dataStore,
                setDataStore,
                dataStoreUpdatedAt,
                selectedItemId,
                setSelectedItemId,
                selectedItemIdUpdatedAt,
                columns,
                selectedColumn,
                searchText,
                searchBarPlaceholder,
                schema,
                state
            }}
        >
            {children}
        </CaptureContext.Provider>
    )
}

export * from "./use"
