/**
 *
 */

import { thoughtsSchema } from "~/domains/shared/data/system"
import { DataColumnList } from "./list"
import { CaptureContextProvider } from "./provider"

export function CaptureLayout() {
    return (
        <CaptureContextProvider config={{ schema: thoughtsSchema }}>
            <DataColumnList />
        </CaptureContextProvider>
    )
}
