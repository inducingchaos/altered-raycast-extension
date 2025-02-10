/**
 *
 */

import { useContext } from "react"
import { CaptureContext } from "./context"
import type { CaptureContextState } from "./types"

export function useCapture(): CaptureContextState {
    const context = useContext(CaptureContext)
    if (!context) throw new Error("`useCapture` must be used within a `CaptureContextProvider`.")

    return context
}
