/**
 *
 */

import { Type } from "arktype"
import { DataType, DataTypeIDKey } from "~/domains/shared/data/definitions/types"
import { DataConstraintID } from "./ids"
import { DataConstraintOptions, InferSchemaFromOptions } from "./options"

export type DataConstraint<
    ID extends DataConstraintID,
    Schema extends Type,
    Options extends DataConstraintOptions<Schema> = DataConstraintOptions<Schema>
> = {
    id: ID
    name: string
    description: string | ((options: InferSchemaFromOptions<Options>) => string)

    label?: string | ((options: InferSchemaFromOptions<Options>) => string)
    instructions: string | ((options: InferSchemaFromOptions<Options>) => string)
    error?: {
        label?: string | ((options: InferSchemaFromOptions<Options>) => string)
        description?: string | ((options: InferSchemaFromOptions<Options>) => string)
    }

    system?: boolean
    types: (DataType["id"] | DataTypeIDKey)[]
    supersedes: DataConstraintID[]
    options: Options | null

    select?: (props: {
        value: string | undefined
        params: InferSchemaFromOptions<Options>
        direction: "previous" | "next"
    }) => string

    validate: (props: { value: string; params: InferSchemaFromOptions<Options> }) => boolean
}

export function createDataConstraint<ID extends DataConstraintID, Schema extends Type>(
    props: DataConstraint<ID, Schema>
): DataConstraint<ID, Schema> {
    return props
}
