/**
 *
 */

"use client"

import { ReactNode, type JSX } from "react"
import { HyperFormContext } from "."
import { HyperFormConfig } from "../definitions"

export function HyperFormContextProvider({
    config: { schemas },
    children
}: {
    config: HyperFormConfig
    children: ReactNode
}): JSX.Element {
    return (
        <HyperFormContext.Provider
            value={{
                schemas
            }}
        >
            {children}
        </HyperFormContext.Provider>
    )
}
