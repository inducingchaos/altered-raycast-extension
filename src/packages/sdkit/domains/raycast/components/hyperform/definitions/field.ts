/**
 *
 */

import { HyperFormConstraint } from "./constraint"

export type HyperFormField = {
    id: string
    name: string
    description: string
    type: string
    required: boolean
    constraints: HyperFormConstraint[]
}
