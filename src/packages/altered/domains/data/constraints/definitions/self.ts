/**
 *
 */

import { Type } from "arktype"
import { DataType } from "~/domains/shared/data/definitions/type"
import { DataConstraintID } from "./ids"
import { DataConstraintOptions, InferSchemaFromOptions } from "./options"

export type DataConstraint<Options extends DataConstraintOptions> = {
    id: DataConstraintID
    name: string
    description: string | ((options: InferSchemaFromOptions<Options>) => string)

    label?: string | ((options: InferSchemaFromOptions<Options>) => string)
    instructions: string | ((options: InferSchemaFromOptions<Options>) => string)
    error?: {
        label?: string | ((options: InferSchemaFromOptions<Options>) => string)
        description?: string | ((options: InferSchemaFromOptions<Options>) => string)
    }

    system?: boolean
    types: DataType["id"][]
    supersedes: DataConstraintID[]
    options: Options | null

    validate: (value: string, options: InferSchemaFromOptions<Options>) => boolean
}

export function createDataConstraint<Options extends DataConstraintOptions<OptionType>, OptionType extends Type>(
    props: DataConstraint<Options>
): DataConstraint<Options> {
    return props
}
