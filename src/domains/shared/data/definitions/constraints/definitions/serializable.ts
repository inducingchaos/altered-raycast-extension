/**
 *
 */

import { DataConstraints } from "../implementations"
import { DataConstraintKey } from "./ids"
import { InferDataConstraintParamsInput } from "./params"

export type DataConstraintParams<
    ID extends DataConstraintKey = DataConstraintKey,
    ParamsConfig extends DataConstraints[ID]["params"] = DataConstraints[ID]["params"]
> = InferDataConstraintParamsInput<ParamsConfig>

export type SerializableDataConstraint<
    ID extends DataConstraintKey = DataConstraintKey,
    ParamsConfig extends DataConstraints[ID]["params"] = DataConstraints[ID]["params"]
> = {
    id: ID
    parameters: DataConstraintParams<ID, ParamsConfig>
}

export function createSerializableDataConstraint<ID extends DataConstraintKey>(
    options: SerializableDataConstraint<ID>
): SerializableDataConstraint<ID> {
    return options
}
