/**
 *
 */

import { createContext } from "react"
import type { CaptureContextState } from "./state"

export const CaptureContext = createContext<CaptureContextState | undefined>(undefined)

export * from "./provider"
export * from "./use"
