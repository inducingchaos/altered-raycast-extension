/**
 *
 */

import { useContext } from "react"
import { HyperFormContext } from "."
import type { HyperFormContextState } from "./state"

export function useHyperForm(): HyperFormContextState {
    const context = useContext(HyperFormContext)
    if (!context) throw new Error("`useHyperForm` must be used within a `HyperFormContextProvider`.")

    return context
}
