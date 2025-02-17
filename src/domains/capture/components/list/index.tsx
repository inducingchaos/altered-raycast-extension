/**
 *
 */

import { List } from "@raycast/api"
import { setContent, changeSelection as _changeSelection } from "../../handlers"
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

        schema,

        state: { view }
    } = useCapture()

    const changeSelection = (value: string | null) =>
        _changeSelection({ selectedItemId: value, setSelectedItemId, selectedItemIdUpdatedAt, schema })

    return (
        <List
            selectedItemId={selectedItemId}
            onSelectionChange={changeSelection}
            searchText={searchText}
            onSearchTextChange={value => setContent({ searchText: value, selectedColumn, setDataStore, dataStoreUpdatedAt })}
            searchBarPlaceholder={searchBarPlaceholder}
            isShowingDetail={view.inspector.isVisible}
        >
            <DataColumnListSection />
        </List>
    )
}
