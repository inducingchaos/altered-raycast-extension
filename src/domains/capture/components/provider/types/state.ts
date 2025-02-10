/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { SerializableDataColumn } from "../../../../shared/data/definitions"
import { DataStore } from "../../../types"

export type CaptureContextState = {
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
    dataStoreUpdatedAt: MutableRefObject<number | undefined>

    selectedItemId: string | undefined
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>

    schema: {
        items: SerializableDataColumn[]
    }

    columns: SerializableDataColumn[]
    selectedColumn: SerializableDataColumn | undefined

    searchText: string
    searchBarPlaceholder: string

    state: {
        selection: {
            id: string | undefined
            updatedAt: number | undefined
            set: (id: string) => void
        }
    }
}
