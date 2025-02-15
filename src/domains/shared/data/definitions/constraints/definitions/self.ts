/**
 *
 */

import { Expand, TypeSchema } from "@sdkit/utils"
import { DataTypeIDKey, dataTypes } from "~/domains/shared/data/definitions/types"
import { DataConstraintID } from "./ids"
import {
    DataConstraintParamsConfig,
    InferDataConstraintParams,
    NullableDataConstraintParamsConfig,
    ValidateDataConstraintParamsConfig
} from "./params"

type DataConstraintPropertyGenerator<
    Type extends InferDataType,
    ParamsConfig extends DataConstraintParamsConfig | null,
    Result = string,
    Params = InferDataConstraintParams<ParamsConfig>
> = (props: { constraint: DataConstraint<DataConstraintID, DataTypeIDKey[], Type, ParamsConfig>; params: Params }) => Result

export type InferDataType<DataTypeIDs extends DataTypeIDKey[] = DataTypeIDKey[]> =
    (typeof dataTypes)[DataTypeIDs[number]]["schema"]["infer"]

export type DataConstraint<
    ID extends DataConstraintID = DataConstraintID,
    DataTypeIDs extends DataTypeIDKey[] = DataTypeIDKey[],
    Type extends InferDataType<DataTypeIDs> = InferDataType<DataTypeIDs>,
    ParamsConfig extends NullableDataConstraintParamsConfig = NullableDataConstraintParamsConfig
> = {
    id: ID
    name: string
    description: string | DataConstraintPropertyGenerator<Type, ParamsConfig>

    label?: string | DataConstraintPropertyGenerator<Type, ParamsConfig>
    instructions: string | DataConstraintPropertyGenerator<Type, ParamsConfig>
    error?: {
        label?: string | DataConstraintPropertyGenerator<Type, ParamsConfig>
        description?: string | DataConstraintPropertyGenerator<Type, ParamsConfig>
    }

    types: DataTypeIDs
    supersedes: DataConstraintID[]
    params: ParamsConfig

    select?: (props: {
        value: string | undefined
        params: InferDataConstraintParams<ParamsConfig>
        direction: "previous" | "next"
    }) => string

    validate?: DataConstraintPropertyGenerator<Type, ParamsConfig, (props: { value: Type }) => boolean>
}

export function createDataConstraint<
    ID extends DataConstraintID,
    DataTypeIDs extends DataTypeIDKey[],
    Type extends InferDataType<DataTypeIDs>,
    ParamsConfig extends ValidateDataConstraintParamsConfig<ParamsConfig>,
    Result extends Expand<DataConstraint<ID, DataTypeIDs, Type, ParamsConfig>, TypeSchema>
>(props: DataConstraint<ID, DataTypeIDs, Type, ParamsConfig>): Result {
    return props as Result
}
