/**
 *
 */

import { createContext } from "react"
import type { CaptureContextState } from "./types"

export const CaptureContext = createContext<CaptureContextState | undefined>(undefined)
