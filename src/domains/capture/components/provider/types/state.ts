/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { SerializableDataColumn } from "../../../../shared/data/definitions"
import { DataStore } from "../../../types"

export type CaptureListContextState = {
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
    dataStoreUpdatedAt: MutableRefObject<number | undefined>

    selectedItemId: string | undefined
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>

    columns: SerializableDataColumn[]
    selectedColumn: SerializableDataColumn | undefined

    searchText: string
    searchBarPlaceholder: string
}
