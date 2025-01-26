/**
 *
 */

import { DataColumnList } from "./list"
import { CaptureListContextProvider } from "./provider"

export function CaptureLayout() {
    return (
        <CaptureListContextProvider>
            <DataColumnList />
        </CaptureListContextProvider>
    )
}
