/**
 *
 */

import { HyperFormField } from "./field"

export type HyperFormSchema = {
    id: string
    name: string
    description: string
    fields: HyperFormField[]
}
