/**
 *
 */

import { Color, Icon, List } from "@raycast/api"
import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from "react"
import { CaptureActions, onSearchTextChange, onSelectionChange } from "./domains/capture"
import { type DataColumn, dataColumns } from "./domains/shared"

export function DataColumnListSectionAccessories({
    value,
    isSelected
}: {
    value: string | undefined
    isSelected: boolean
}): List.Item.Accessory[] {
    const accessories: List.Item.Accessory[] = []

    const errorAccessory = {
        tag: { value: "", color: Color.Red },
        icon: { source: Icon.ExclamationMark, tintColor: Color.Red },
        tooltip: "Error"
    }
    if (!isSelected && value && value.length > 10) accessories.push(errorAccessory)

    const valueAccessory = { text: { value: value ?? "", color: Color.PrimaryText }, tooltip: "Search" }
    if (isSelected === false) accessories.push(valueAccessory)

    const rulesAccessories = [
        { tag: { value: "Max: 15", color: Color.SecondaryText }, tooltip: "Rules2" },
        { tag: { value: "Min: 0", color: Color.SecondaryText }, tooltip: "Rules3" },
        { tag: { value: "Required", color: Color.SecondaryText }, tooltip: "Rules" }
    ]
    const spacerAccessory = { text: " ".repeat(128) }
    if (isSelected) accessories.push(...rulesAccessories, spacerAccessory)

    return accessories
}

export function DataColumnListItem({
    column,
    isSelected,

    searchText,
    setSearchText,

    searchTextLocked,
    setSearchTextLocked
}: {
    column: DataColumn
    isSelected: boolean

    searchText: string
    setSearchText: Dispatch<SetStateAction<string>>

    searchTextLocked: boolean
    setSearchTextLocked: Dispatch<SetStateAction<boolean>>
}) {
    const [value, setValue] = useState<string>()

    useEffect(() => {
        if (searchTextLocked && isSelected && searchText !== value) setValue(searchText)

        if (!searchTextLocked) {
            setSearchText(value ?? "")
            setSearchTextLocked(true)
        }
    }, [searchText])

    return (
        <List.Item
            key={column.id}
            id={column.id}
            title={isSelected ? column.label : ""}
            subtitle={isSelected ? column.type : column.label}
            actions={<CaptureActions />}
            accessories={DataColumnListSectionAccessories({ value, isSelected })}
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

export default function Capture() {
    const [searchText, setSearchText] = useState("")
    const [searchTextLocked, setSearchTextLocked] = useState(false)

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
            <DataColumnListSection
                selectedItemId={selectedItemId}
                searchText={searchText}
                setSearchText={setSearchText}
                searchTextLocked={searchTextLocked}
                setSearchTextLocked={setSearchTextLocked}
            />
        </List>
    )
}
