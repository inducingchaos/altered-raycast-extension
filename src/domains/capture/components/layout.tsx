/**
 *
 */

import { serializableThoughtsSchema } from "~/domains/shared/data"
import { DataColumnList } from "./list"
import { CaptureContextProvider } from "./context/provider"

export function CaptureForm() {
    return (
        <CaptureContextProvider config={{ schema: serializableThoughtsSchema }}>
            <DataColumnList />
        </CaptureContextProvider>
    )
}
