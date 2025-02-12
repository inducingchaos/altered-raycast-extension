/**
 *
 */

import { thoughtsSchema } from "~/domains/shared/data/system"
import { DataColumnList } from "./list"
import { CaptureContextProvider } from "./context/provider"

export function CaptureForm() {
    return (
        <CaptureContextProvider config={{ schema: thoughtsSchema }}>
            <DataColumnList />
        </CaptureContextProvider>
    )
}
