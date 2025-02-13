/**
 *
 */

import { DataValidationError } from "../../shared/data/utils/rules/validate/store"

export type DataStoreState = {
    value: string
    errors: DataValidationError[]
}

export type DataStore = Map<string, DataStoreState>
