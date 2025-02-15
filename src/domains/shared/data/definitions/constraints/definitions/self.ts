/**
 *
 */

import { Expand, TypeSchema } from "@sdkit/utils"
import { DataType, DataTypeIDKey } from "~/domains/shared/data/definitions/types"
import { DataConstraintID } from "./ids"
import { DataConstraintParamsConfig, InferDataConstraintParams, ValidateDataConstraintParamsConfig } from "./params"

type DataConstraintGenerator<
    ParamsConfig extends DataConstraintParamsConfig,
    Type extends TypeSchema,
    Result = string,
    Params = InferDataConstraintParams<ParamsConfig>
> = (props: { constraint: DataConstraint<ParamsConfig, Type>; params: Params }) => Result

export type DataConstraint<
    ParamsConfig extends DataConstraintParamsConfig = DataConstraintParamsConfig,
    Type extends TypeSchema = TypeSchema,
    ID extends DataConstraintID = DataConstraintID
> = {
    id: ID
    name: string
    description: string | DataConstraintGenerator<ParamsConfig, Type>

    label?: string | DataConstraintGenerator<ParamsConfig, Type>
    instructions: string | DataConstraintGenerator<ParamsConfig, Type>
    error?: {
        label?: string | DataConstraintGenerator<ParamsConfig, Type>
        description?: string | DataConstraintGenerator<ParamsConfig, Type>
    }

    types: (DataType["id"] | DataTypeIDKey)[]
    supersedes: DataConstraintID[]
    params: ParamsConfig | null

    select?: (props: {
        value: string | undefined
        params: InferDataConstraintParams<ParamsConfig>
        direction: "previous" | "next"
    }) => string
    validate?: DataConstraintGenerator<ParamsConfig, Type, (value: Type["infer"]) => boolean>
}

export function createDataConstraint<
    ID extends DataConstraintID,
    Type extends TypeSchema,
    Params extends ValidateDataConstraintParamsConfig<Params>,
    Result extends Expand<DataConstraint<Params, Type, ID>, TypeSchema>
>(props: DataConstraint<Params, Type, ID>): Result {
    return props as Result
}
