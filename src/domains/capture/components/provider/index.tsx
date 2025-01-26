/**
 *
 */

"use client"

import { useRef, useState, type JSX } from "react"
import { thoughtsSchema } from "../../../shared/data/system/schemas/thoughts"
import { DataStore } from "../../types"
import { CaptureListContext } from "./context"
import type { CaptureListContextProviderProps } from "./types"

export function CaptureListContextProvider({ children }: CaptureListContextProviderProps): JSX.Element {
    const [dataStore, setDataStore] = useState<DataStore>(new Map())
    const dataStoreUpdatedAt = useRef<number | undefined>()

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const selectedItemIdUpdatedAt = useRef<number | undefined>()

    const columns = thoughtsSchema.columns
    const selectedColumn = columns.find(column => column.id === selectedItemId)

    const searchText = (selectedItemId && dataStore.get(selectedItemId)?.value) ?? ""
    const searchBarPlaceholder = `${
        (selectedColumn?.description?.endsWith(".") ? selectedColumn.description.slice(0, -1) : selectedColumn?.description) ??
        "Loading"
    }...`

    return (
        <CaptureListContext.Provider
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
                searchBarPlaceholder
            }}
        >
            {children}
        </CaptureListContext.Provider>
    )
}

export * from "./use"
