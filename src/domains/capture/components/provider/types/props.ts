/**
 *
 */

import type { ReactNode } from "react"
import type { SerializableDataSchema } from "../../../../shared/data/definitions"
export type CaptureContextProviderProps = {
    config: {
        schema: SerializableDataSchema
    }
    children: ReactNode
}
