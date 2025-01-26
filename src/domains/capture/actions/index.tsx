/**
 *
 */

import { ActionPanel } from "@raycast/api"
import { Dispatch, SetStateAction } from "react"
import { DataStore } from "../types"
import { ModifyActions } from "./modify"
import { SubmitActions } from "./submit"
import { SerializableDataColumn } from "../../shared/data/definitions"

export function CaptureActions({
    columns,
    dataStore,
    setDataStore
}: {
    columns: SerializableDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
}): JSX.Element {
    return (
        <ActionPanel>
            <SubmitActions columns={columns} dataStore={dataStore} setDataStore={setDataStore} />
            <ModifyActions />
        </ActionPanel>
    )
}
