/**
 *
 */

"use client"

import { ReactNode, useMemo, useRef, useState, type JSX } from "react"
import { SerializableDataSchema } from "~/domains/shared/data/definitions"
import { CaptureContext } from "."
import { changeSelection, setContent } from "../../handlers"
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
    const schema = useMemo(() => {
        return {
            ...config.schema,
            id: config.schema.id ?? nanoid(),
            columns: config.schema.columns.map(column => ({
                ...column,
                id: column.id ?? nanoid()
            }))
        }
    }, [config.schema])

    const [dataStore, setDataStore] = useState<DataStore>(new Map())
    const dataStoreUpdatedAt = useRef<number | undefined>()

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const selectedItemIdUpdatedAt = useRef<number | undefined>()

    const [inspectorVisibility, setInspectorVisibility] = useState<"visible" | "hidden">("hidden")

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
                set: (value: (prev: DataStore) => DataStore) => {
                    setDataStore(prev => new Map(value(prev)))
                    dataStoreUpdatedAt.current = Date.now()

                    return
                },
                reset: () => setDataStore(new Map())
            },
            content: {
                searchText,
                set: (value: string) => setContent({ searchText: value, selectedColumn, setDataStore, dataStoreUpdatedAt })
            },
            selection: {
                id: selectedItemId,
                updatedAt: selectedItemIdUpdatedAt.current,
                set: (id: string | undefined) =>
                    changeSelection({ selectedItemId: id ?? null, setSelectedItemId, selectedItemIdUpdatedAt, schema })
            },
            view: {
                inspector: {
                    isVisible: inspectorVisibility === "visible",
                    toggle: () => setInspectorVisibility(prev => (prev === "visible" ? "hidden" : "visible")),
                    show: () => setInspectorVisibility("visible"),
                    hide: () => setInspectorVisibility("hidden")
                }
            }
        }),
        [dataStore, selectedItemId, inspectorVisibility]
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
