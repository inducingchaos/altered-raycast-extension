/**
 *
 */

import { DataRuleError } from "../../shared/data/definitions"

export type DataStoreState = {
    value: string
    errors: DataRuleError[]
}

export type DataStore = Map<string, DataStoreState>
