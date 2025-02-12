/**
 *
 */

"use client"

import { ReactNode, useMemo, useRef, useState, type JSX } from "react"
import { SerializableDataSchema } from "~/domains/shared/data/definitions"
import { CaptureContext } from "."
import { changeSelection } from "../../handlers"
import { DataStore } from "../../types"
import { nanoid } from "nanoid"

export function CaptureContextProvider({
    config,
    children
}: {
    config: {
        schema: SerializableDataSchema
    }
    children: ReactNode
}): JSX.Element {
    const schema = {
        ...config.schema,
        id: config.schema.id ?? nanoid(),
        columns: config.schema.columns.map(column => ({
            ...column,
            id: column.id ?? nanoid()
        }))
    }

    config.schema.columns.map(column => ({
        ...column,
        id: column.id ?? nanoid()
    }))
    const [dataStore, setDataStore] = useState<DataStore>(new Map())
    const dataStoreUpdatedAt = useRef<number | undefined>()

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const selectedItemIdUpdatedAt = useRef<number | undefined>()

    const columns = schema.columns

    const selectedColumn = columns.find(column => column.id === selectedItemId)

    const searchText = (selectedItemId && dataStore.get(selectedItemId)?.value) ?? ""
    const searchBarPlaceholder = `${
        (selectedColumn?.description?.endsWith(".") ? selectedColumn.description.slice(0, -1) : selectedColumn?.description) ??
        "Loading"
    }...`

    const state = useMemo(
        () => ({
            store: {
                value: dataStore,
                set: (value: (prev: DataStore) => DataStore) => setDataStore(prev => new Map(value(prev)))
            },
            selection: {
                id: selectedItemId,
                updatedAt: selectedItemIdUpdatedAt.current,
                set: (id: string | undefined) =>
                    changeSelection({ selectedItemId: id ?? null, setSelectedItemId, selectedItemIdUpdatedAt, schema })
            }
        }),
        [dataStore, selectedItemId]
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
