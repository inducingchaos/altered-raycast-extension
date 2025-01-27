/**
 *
 */

import { List } from "@raycast/api"
import { onSearchTextChange, onSelectionChange } from "../../handlers"
import { useCaptureList } from "../provider"
import { DataColumnListSection } from "./section"

export function DataColumnList() {
    const {
        setDataStore,
        dataStoreUpdatedAt,

        selectedItemId,
        setSelectedItemId,
        selectedItemIdUpdatedAt,

        selectedColumn,

        searchText,
        searchBarPlaceholder
    } = useCaptureList()

    return (
        <List
            selectedItemId={selectedItemId}
            onSelectionChange={value =>
                onSelectionChange({
                    selectedItemId: value,
                    setSelectedItemId,
                    selectedItemIdUpdatedAt
                })
            }
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
