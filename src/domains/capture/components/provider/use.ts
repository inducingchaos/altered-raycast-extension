/**
 *
 */

import { useContext } from "react"
import { CaptureListContext } from "./context"
import type { CaptureListContextState } from "./types"

export function useCaptureList(): CaptureListContextState {
    const context = useContext(CaptureListContext)
    if (!context) throw new Error("`useCaptureList` must be used within a `CaptureListContextProvider`.")

    return context
}
