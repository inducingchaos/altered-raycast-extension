/**
 *
 */

import { List } from "@raycast/api"
import { useRef, useState } from "react"
import { onSearchTextChange, onSelectionChange } from "../../handlers"
import { DataStore } from "../../types"
import { DataColumnListSection } from "./section"
import { thoughtsSchema } from "../../../shared/data/system/schemas/thoughts"

export function DataColumnList() {
    const [dataStore, setDataStore] = useState<DataStore>(new Map())

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const selectedAt = useRef(0)

    const dataColumns = thoughtsSchema.columns
    const selectedDataColumn = selectedItemId ? dataColumns.find(column => column.id === selectedItemId) : null

    const searchText = (selectedItemId && dataStore.get(selectedItemId)?.value) ?? ""
    const searchBarPlaceholder = `${
        selectedDataColumn?.description?.endsWith(".")
            ? selectedDataColumn.description.slice(0, -1)
            : (selectedDataColumn?.description ?? "Loading")
    }...`

    return (
        <List
            selectedItemId={selectedItemId}
            onSelectionChange={value =>
                onSelectionChange({
                    selectedItemId: value,
                    selectedAt,
                    setSelectedItemId
                })
            }
            searchText={searchText}
            onSearchTextChange={value => onSearchTextChange({ searchText: value, selectedItemId, setDataStore })}
            searchBarPlaceholder={searchBarPlaceholder}
        >
            <DataColumnListSection selectedItemId={selectedItemId} dataColumns={dataColumns} dataStore={dataStore} />
        </List>
    )
}
