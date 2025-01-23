/**
 *
 */

import { List } from "@raycast/api"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { CaptureActions, onSearchTextChange, onSelectionChange } from "./domains/capture"
import { type DataColumn, dataColumns } from "./domains/shared"

export function DataColumnListItem({
    column,
    isSelected,
    searchText
}: {
    column: DataColumn
    isSelected: boolean
    searchText: string
}) {
    // Create a stable function reference for accessories
    const getAccessories = useCallback((): List.Item.Accessory[] => {
        return searchText ? [{ text: searchText }] : []
    }, [searchText])

    return (
        <List.Item
            key={column.id}
            id={column.id}
            title={isSelected ? column.label : ""}
            subtitle={isSelected ? column.type : column.label}
            actions={<CaptureActions />}
            accessories={getAccessories()}
        />
    )
}

/**
 * @remarks May not be necessary.
 */
export const MemoizedDataColumnListItem = memo(DataColumnListItem)

export function DataColumnListSection({
    selectedItemId,
    searchText
}: {
    selectedItemId: string | undefined
    searchText: string
}) {
    return (
        <List.Section>
            {dataColumns.map(column => (
                <MemoizedDataColumnListItem
                    key={column.id}
                    column={column}
                    isSelected={selectedItemId === column.id}
                    searchText={searchText}
                />
            ))}
        </List.Section>
    )
}

// /**
//  * Delays each state update by a fixed amount.
//  * Each change triggers its own delayed update.
//  * Example: Typing "123" with 25ms delay:
//  * - "1" appears after 25ms
//  * - "12" appears after 25ms
//  * - "123" appears after 25ms
//  */
// function useDelayedState<T>(value: T, delay: number): T {
//     const [delayedValue, setDelayedValue] = useState<T>(value)

//     useEffect(() => {
//         const timer = setTimeout(() => setDelayedValue(value), delay)
//         return () => clearTimeout(timer)
//     }, [value, delay])

//     return delayedValue
// }

/**
 * Only updates state after value stops changing for delay period.
 * Resets timer on each change.
 * Example: Typing "123" with 25ms delay:
 * - Nothing appears while typing
 * - "123" appears 25ms after last keystroke
 */
function useDebounceState<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    const timeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [value, delay])

    return debouncedValue
}

export default function Capture() {
    // Core state
    const [searchText, setSearchText] = useState("")
    // const debouncedSearchText = useDelayedState(searchText, 25)
    const debouncedSearchText = useDebounceState(searchText, 25)

    const [selectedItemId, setSelectedItemId] = useState<string | undefined>()
    const lastSelectionTime = useRef(0)
    const pendingSelection = useRef<string | null>(null)

    useEffect(() => {
        if (!pendingSelection.current) return

        const timeSinceLastSelection = Date.now() - lastSelectionTime.current
        if (timeSinceLastSelection > 25) {
            onSelectionChange({
                selectedItemId: pendingSelection.current,
                setSelectedItemId
            })
            pendingSelection.current = null
        }
    }, [debouncedSearchText])

    const handleSearchTextChange = useCallback((value: string) => {
        onSearchTextChange({ searchText: value, setSearchText })
    }, [])

    const handleSelectionChange = useCallback((value: string | null) => {
        if (!value) return

        const now = Date.now()
        const timeSinceLastSelection = now - lastSelectionTime.current

        if (timeSinceLastSelection < 25) {
            pendingSelection.current = value
            return
        }

        lastSelectionTime.current = now
        onSelectionChange({ selectedItemId: value, setSelectedItemId })
    }, [])

    return (
        <List
            onSearchTextChange={handleSearchTextChange}
            onSelectionChange={handleSelectionChange}
            searchText={searchText}
            selectedItemId={selectedItemId}
            searchBarPlaceholder={"Your thought..."}
        >
            <DataColumnListSection selectedItemId={selectedItemId} searchText={debouncedSearchText} />
        </List>
    )
}
