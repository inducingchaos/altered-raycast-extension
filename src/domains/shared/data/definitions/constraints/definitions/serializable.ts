/**
 *
 */

import { DataConstraints } from "../implementations"
import { DataConstraintID } from "./ids"
import { DataConstraintOptions, InferSchemaFromOptions } from "./options"

export type SerializableDataConstraint<
    ID extends DataConstraintID = DataConstraintID,
    Options = DataConstraints[ID]["options"]
> = {
    id: ID
    parameters: Options extends DataConstraintOptions ? InferSchemaFromOptions<Options> : never
}

export function createSerializableDataConstraint<ID extends DataConstraintID>(
    options: SerializableDataConstraint<ID>
): SerializableDataConstraint<ID> {
    return options
}
