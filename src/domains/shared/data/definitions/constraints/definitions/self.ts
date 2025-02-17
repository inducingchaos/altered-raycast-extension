/**
 *
 */

import { Expand, TypeSchema } from "@sdkit/utils"
import { DataTypeKey, dataTypes } from "~/domains/shared/data/definitions/types"
import { DataConstraintKey } from "./ids"
import { DataConstraintParamsConfig, InferDataConstraintParamsOutput, ValidateDataConstraintParamsConfig } from "./params"

type DataConstraintPropertyGenerator<
    Type extends InferDataType,
    ParamsConfig extends DataConstraintParamsConfig,
    ExtraProps extends object = object,
    Result = string,
    Params = InferDataConstraintParamsOutput<ParamsConfig>
> = (
    props: { constraint: DataConstraint<DataConstraintKey, DataTypeKey[], Type, ParamsConfig>; params: Params } & ExtraProps
) => Result

export type InferDataType<DataTypeIDs extends DataTypeKey[] = DataTypeKey[]> =
    (typeof dataTypes)[DataTypeIDs[number]]["schema"]["infer"]

export type DataConstraint<
    ID extends DataConstraintKey = DataConstraintKey,
    DataTypeIDs extends DataTypeKey[] = DataTypeKey[],
    Type extends InferDataType<DataTypeIDs> = InferDataType<DataTypeIDs>,
    ParamsConfig extends DataConstraintParamsConfig = DataConstraintParamsConfig
> = {
    id: ID
    name: string
    description: string | DataConstraintPropertyGenerator<Type, ParamsConfig>

    info?: string | DataConstraintPropertyGenerator<Type, ParamsConfig, object, { title: string; description: string }[]>

    label?: string | DataConstraintPropertyGenerator<Type, ParamsConfig>
    instructions: string | DataConstraintPropertyGenerator<Type, ParamsConfig>
    error?: {
        label?: string | DataConstraintPropertyGenerator<Type, ParamsConfig>
        description?: string | DataConstraintPropertyGenerator<Type, ParamsConfig>
    }

    system?: boolean
    types: DataTypeIDs
    supersedes: DataConstraintKey[]
    params?: ParamsConfig

    select?: DataConstraintPropertyGenerator<Type, ParamsConfig, { value: string | undefined; direction: "previous" | "next" }>

    validate: DataConstraintPropertyGenerator<Type, ParamsConfig, { value: Type }, boolean>
}

export function createDataConstraint<
    ID extends DataConstraintKey,
    DataTypeIDs extends DataTypeKey[],
    Type extends InferDataType<DataTypeIDs>,
    ParamsConfig extends ValidateDataConstraintParamsConfig<ParamsConfig>,
    Result extends Expand<DataConstraint<ID, DataTypeIDs, Type, ParamsConfig>, TypeSchema>
>(props: DataConstraint<ID, DataTypeIDs, Type, ParamsConfig>): Result {
    return props as Result
}
