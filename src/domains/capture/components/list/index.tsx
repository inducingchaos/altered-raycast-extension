/**
 *
 */

import { List } from "@raycast/api"
import { onSearchTextChange, changeSelection as _changeSelection } from "../../handlers"
import { useCapture } from "../context"
import { DataColumnListSection } from "./section"

export function DataColumnList() {
    // covert to new capture context
    const {
        setDataStore,
        dataStoreUpdatedAt,

        selectedItemId,
        setSelectedItemId,
        selectedItemIdUpdatedAt,

        selectedColumn,

        searchText,
        searchBarPlaceholder,

        schema
    } = useCapture()

    const changeSelection = (value: string | null) =>
        _changeSelection({ selectedItemId: value, setSelectedItemId, selectedItemIdUpdatedAt, schema })

    return (
        <List
            selectedItemId={selectedItemId}
            onSelectionChange={changeSelection}
            searchText={searchText}
            onSearchTextChange={value =>
                onSearchTextChange({ searchText: value, selectedColumn, setDataStore, dataStoreUpdatedAt })
            }
            searchBarPlaceholder={searchBarPlaceholder}
        >
            <DataColumnListSection />
        </List>
    )
}
