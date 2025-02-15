/**
 *
 */

import { useContext } from "react"
import { CaptureContext } from "."
import type { CaptureContextState } from "./state"

export function useCapture(): CaptureContextState {
    const context = useContext(CaptureContext)
    if (!context) throw new Error("`useCapture` must be used within a `CaptureContextProvider`.")

    return context
}
