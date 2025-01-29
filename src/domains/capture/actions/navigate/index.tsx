/**
 *
 */

import { Action, ActionPanel, Icon } from "@raycast/api"
import { Dispatch, SetStateAction } from "react"
import { SerializableDataColumn } from "../../../shared/data/definitions"
import { useCaptureList } from "../../components/provider"
import { onSelectionChange } from "../../handlers"
import { DataStore } from "../../types"

export function NavigateActions(): JSX.Element {
    const { columns, selectedItemId, setSelectedItemId, selectedItemIdUpdatedAt, dataStore, setDataStore } = useCaptureList()

    return (
        <ActionPanel.Section title="Navigate">
            <Action
                title="Next"
                icon={Icon.ArrowRight}
                shortcut={{ modifiers: [], key: "tab" }}
                onAction={() => {
                    const currentIndex = columns.findIndex(column => column.id === selectedItemId)
                    const nextIndex = (currentIndex + 1) % columns.length

                    onSelectionChange({
                        selectedItemIdUpdatedAt,
                        selectedItemId: columns[nextIndex]?.id,
                        setSelectedItemId
                    })
                }}
            />
            <Action
                title="Previous"
                icon={Icon.ArrowLeft}
                shortcut={{ modifiers: ["shift"], key: "tab" }}
                onAction={() => {
                    const currentIndex = columns.findIndex(column => column.id === selectedItemId)
                    const previousIndex = (currentIndex - 1 + columns.length) % columns.length

                    onSelectionChange({
                        selectedItemIdUpdatedAt,
                        selectedItemId: columns[previousIndex]?.id,
                        setSelectedItemId
                    })
                }}
            />

            <Action
                title="Next Option"
                icon={Icon.ArrowRightCircle}
                shortcut={{ modifiers: ["ctrl"], key: "tab" }}
                onAction={() => selectOption({ inDirection: "next", columns, dataStore, setDataStore, selectedItemId })}
            />
            <Action
                title="Previous Option"
                icon={Icon.ArrowLeftCircle}
                shortcut={{ modifiers: ["shift", "ctrl"], key: "tab" }}
                onAction={() => selectOption({ inDirection: "previous", columns, dataStore, setDataStore, selectedItemId })}
            />
        </ActionPanel.Section>
    )
}

function selectOption({
    inDirection,
    columns,
    dataStore,
    setDataStore,
    selectedItemId
}: {
    inDirection: "next" | "previous"
    columns: SerializableDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
    selectedItemId: string | undefined
}) {
    if (columns.find(column => column.id === selectedItemId)?.type !== "boolean") return

    if (!selectedItemId) return

    const currentValue = dataStore.get(selectedItemId)?.value
    const nextValue =
        inDirection === "next"
            ? currentValue?.toLowerCase() === "true"
                ? "False"
                : "True"
            : currentValue?.toLowerCase() === "false"
              ? "True"
              : "False"

    setDataStore(prev => new Map(prev).set(selectedItemId, { value: nextValue, errors: [] }))
}
