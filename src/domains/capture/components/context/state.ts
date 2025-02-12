/**
 *
 */

import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { SafeDataColumn, SafeDataSchema } from "~/domains/shared/data"
import { DataStore } from "../../types"

export type CaptureContextState = {
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
    dataStoreUpdatedAt: MutableRefObject<number | undefined>

    selectedItemId: string | undefined
    setSelectedItemId: Dispatch<SetStateAction<string | undefined>>
    selectedItemIdUpdatedAt: MutableRefObject<number | undefined>

    schema: SafeDataSchema

    columns: SafeDataColumn[]
    selectedColumn: SafeDataColumn | undefined

    searchText: string
    searchBarPlaceholder: string

    state: {
        store: {
            value: DataStore
            set: (value: (prev: DataStore) => DataStore) => void
        }
        selection: {
            id: string | undefined
            updatedAt: number | undefined
            set: (id: string) => void
        }
    }
}
