/**
 *
 */

import { createContext } from "react"
import type { CaptureListContextState } from "./types"

export const CaptureListContext = createContext<CaptureListContextState | undefined>(undefined)
