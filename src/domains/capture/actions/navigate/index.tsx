/**
 *
 */

import { Action, ActionPanel, Icon } from "@raycast/api"
import { SelectListItemAction } from "@sdkit/domains/raycast/actions/navigation/select-row"
import { Dispatch, SetStateAction } from "react"
import { SerializableDataColumn } from "../../../shared/data/definitions"
import { useCapture } from "../../components/provider"
import { DataStore } from "../../types"

export function NavigateActions(): JSX.Element {
    const { columns, dataStore, setDataStore, schema, state } = useCapture()

    return (
        <ActionPanel.Section title="Navigate">
            <SelectListItemAction
                direction="next"
                schema={schema}
                state={{ selection: { id: state.selection.id, set: state.selection.set } }}
            />
            <SelectListItemAction
                direction="previous"
                schema={schema}
                state={{ selection: { id: state.selection.id, set: state.selection.set } }}
            />
            <Action
                title="Next Option"
                icon={Icon.ArrowRightCircle}
                shortcut={{ modifiers: ["ctrl"], key: "tab" }}
                onAction={() =>
                    selectOption({
                        inDirection: "next",
                        columns,
                        dataStore,
                        setDataStore,
                        selectedItemId: state.selection.id
                    })
                }
            />
            <Action
                title="Previous Option"
                icon={Icon.ArrowLeftCircle}
                shortcut={{ modifiers: ["shift", "ctrl"], key: "tab" }}
                onAction={() =>
                    selectOption({
                        inDirection: "previous",
                        columns,
                        dataStore,
                        setDataStore,
                        selectedItemId: state.selection.id
                    })
                }
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
