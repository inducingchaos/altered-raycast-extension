/**
 *
 */

import { DataConstraints } from "../implementations"
import { DataConstraintID } from "./ids"
import { InferDataConstraintParamsInput } from "./params"

export type SerializableDataConstraint<
    ID extends DataConstraintID = DataConstraintID,
    ParamsConfig extends DataConstraints[ID]["params"] = DataConstraints[ID]["params"],
    Params extends InferDataConstraintParamsInput<ParamsConfig> = InferDataConstraintParamsInput<ParamsConfig>
> = {
    id: ID
    parameters: Params
}

export function createSerializableDataConstraint<ID extends DataConstraintID>(
    options: SerializableDataConstraint<ID>
): SerializableDataConstraint<ID> {
    return options
}
