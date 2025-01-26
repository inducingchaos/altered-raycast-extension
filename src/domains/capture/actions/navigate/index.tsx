/**
 *
 */

import { Action, ActionPanel, Icon } from "@raycast/api"
import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { SerializableDataColumn } from "../../../shared/data/definitions"
import { onSelectionChange } from "../../handlers"

export function NavigateActions({
    columns,
    selectedItemId,
    setSelectedItemId,
    selectedItemIdUpdatedAt
}: {
    columns: SerializableDataColumn[]
    selectedItemId: string | undefined
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>
}): JSX.Element {
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
        </ActionPanel.Section>
    )
}
