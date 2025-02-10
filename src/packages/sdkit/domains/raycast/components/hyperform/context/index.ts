/**
 *
 */

import { createContext } from "react"
import type { HyperFormContextState } from "./state"

export const HyperFormContext = createContext<HyperFormContextState | undefined>(undefined)

export * from "./provider"
export * from "./use"
