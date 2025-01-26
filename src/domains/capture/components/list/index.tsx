/**
 *
 */

import { List } from "@raycast/api"
import { useRef, useState } from "react"
import { thoughtsSchema } from "../../../shared/data/system/schemas/thoughts"
import { onSearchTextChange, onSelectionChange } from "../../handlers"
import { DataStore } from "../../types"
import { DataColumnListSection } from "./section"

export function DataColumnList() {
    const [dataStore, setDataStore] = useState<DataStore>(new Map())

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const selectedAt = useRef(0)

    const columns = thoughtsSchema.columns
    const selectedColumn = columns.find(column => column.id === selectedItemId)

    const searchText = (selectedItemId && dataStore.get(selectedItemId)?.value) ?? ""
    const searchBarPlaceholder = `${
        (selectedColumn?.description?.endsWith(".") ? selectedColumn.description.slice(0, -1) : selectedColumn?.description) ??
        "Loading"
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
            onSearchTextChange={value => onSearchTextChange({ searchText: value, selectedColumn, setDataStore })}
            searchBarPlaceholder={searchBarPlaceholder}
        >
            <DataColumnListSection selectedItemId={selectedItemId} columns={columns} dataStore={dataStore} />
        </List>
    )
}
