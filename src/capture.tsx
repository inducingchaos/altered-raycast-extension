/**
 *
 */

import { List } from "@raycast/api"
import { Dispatch, memo, SetStateAction, useLayoutEffect, useRef, useState } from "react"
import { CaptureActions, getAccessories, onSearchTextChange, onSelectionChange } from "./domains/capture"
import { type DataColumn, dataColumns } from "./domains/shared"

export function DataColumnListItem({
    column,
    isSelected,

    searchText
}: {
    column: DataColumn
    isSelected: boolean

    searchText: string
    setSearchText: Dispatch<SetStateAction<string>>

    searchTextLocked: boolean
    setSearchTextLocked: Dispatch<SetStateAction<boolean>>
}) {
    const [value, setValue] = useState<string>()

    useLayoutEffect(() => {
        if (isSelected) setValue(searchText)
        // if (searchTextLocked && isSelected && searchText !== value) setValue(searchText)

        // if (!searchTextLocked) {
        //     setSearchText(value ?? "")
        //     setSearchTextLocked(true)
        // }
    }, [searchText])

    return (
        <List.Item
            key={column.id}
            id={column.id}
            title={isSelected ? column.label : ""}
            subtitle={isSelected ? column.type : column.label}
            actions={<CaptureActions />}
            accessories={getAccessories({ value, isSelected })}
        />
    )
}

/**
 * @remarks May not be necessary.
 */
export const MemoizedDataColumnListItem = memo(DataColumnListItem)

export function DataColumnListSection({
    selectedItemId,

    searchText,
    setSearchText,

    searchTextLocked,
    setSearchTextLocked
}: {
    selectedItemId: string | undefined

    searchText: string
    setSearchText: Dispatch<SetStateAction<string>>

    searchTextLocked: boolean
    setSearchTextLocked: Dispatch<SetStateAction<boolean>>
}) {
    return (
        <List.Section>
            {dataColumns.map(column => (
                <MemoizedDataColumnListItem
                    key={column.id}
                    column={column}
                    isSelected={selectedItemId === column.id}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    searchTextLocked={searchTextLocked}
                    setSearchTextLocked={setSearchTextLocked}
                />
            ))}
        </List.Section>
    )
}

type CaptureItemsErrorID = (typeof captureItemsErrors)[number]["id"]

export type DataColumnStore = Record<
    string,
    {
        value: string
        errors: [] | null
    }
>

export default function Capture() {
    const [dataColumns, setDataColumns] = useState<DataColumnStore>({})

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const selectedAt = useRef(0)

    return (
        <List
            onSearchTextChange={value => onSearchTextChange({ searchText: value, setSearchText })}
            onSelectionChange={value =>
                onSelectionChange({
                    selectedItemId: value,
                    selectedAt,
                    setSelectedItemId,
                    searchTextLocked,
                    setSearchTextLocked
                })
            }
            searchText={searchText}
            selectedItemId={selectedItemId}
            searchBarPlaceholder={"Your thought..."}
        >
            <DataColumnListSection selectedItemId={selectedItemId} searchText={searchText} setSearchText={setSearchText} />
        </List>
    )
}
