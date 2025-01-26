/**
 *
 */

import { ActionPanel } from "@raycast/api"
import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { DataStore } from "../types"
import { ModifyActions } from "./modify"
import { SubmitActions } from "./submit"
import { SerializableDataColumn } from "../../shared/data/definitions"
import { NavigateActions } from "./navigate"

export function CaptureActions({
    columns,
    dataStore,
    setDataStore,
    selectedItemId,
    setSelectedItemId,
    selectedItemIdUpdatedAt
}: {
    columns: SerializableDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
    selectedItemId: string | undefined
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>
}): JSX.Element {
    return (
        <ActionPanel>
            <SubmitActions columns={columns} dataStore={dataStore} setDataStore={setDataStore} />
            <ModifyActions />
            <NavigateActions
                columns={columns}
                selectedItemId={selectedItemId}
                setSelectedItemId={setSelectedItemId}
                selectedItemIdUpdatedAt={selectedItemIdUpdatedAt}
            />
        </ActionPanel>
    )
}
