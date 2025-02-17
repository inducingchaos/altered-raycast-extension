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
    Label extends "number" | "boolean" | "string",
    ExtraProps extends object = object,
    Result = string,
    Params = InferDataConstraintParamsOutput<ParamsConfig>
> = (
    props: {
        constraint: DataConstraint<DataConstraintKey, DataTypeKey[], Type, ParamsConfig, Label>
        params: Params
    } & ExtraProps
) => Result

export type InferDataType<DataTypeIDs extends DataTypeKey[] = DataTypeKey[]> =
    (typeof dataTypes)[DataTypeIDs[number]]["schema"]["infer"]

// type InferOptionalityFromValue<T> = undefined extends T ? T | undefined : T

// type InferResolutionFromRecord<T> = {
//     [K in keyof T]: InferOptionalityFromValue<T[K]>
// }

// inference

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ResolvePropOptionality<Obj extends object, Key extends keyof Obj, Value extends Obj[Key]> = Value extends
    | undefined
    | Record<string, never>
    ? Omit<Obj, Key>
    : Omit<Obj, Key> & {
          [K in Key]: Value
      }

export type DataConstraint<
    ID extends DataConstraintKey = DataConstraintKey,
    DataTypeIDs extends DataTypeKey[] = DataTypeKey[],
    Type extends InferDataType<DataTypeIDs> = InferDataType<DataTypeIDs>,
    ParamsConfig extends DataConstraintParamsConfig = DataConstraintParamsConfig,
    Label extends "number" | "boolean" | "string" = "number" | "boolean" | "string"
> = {
    id: ID
    name: string
    description: string | DataConstraintPropertyGenerator<Type, ParamsConfig, Label>

    label?: Label
    // manually split out props for testing
    instructions:
        | string
        | ((props: {
              constraint: Expand<
                  ResolvePropOptionality<
                      //       ResolvePropOptionality<
                      DataConstraint<DataConstraintKey, DataTypeKey[], Type, ParamsConfig, Label>,
                      //           "params",
                      //           ParamsConfig
                      //       >,
                      "label",
                      Label
                  >
              >
              //   constraint: {
              //       params: ParamsConfig
              //   }
              params: InferDataConstraintParamsOutput<ParamsConfig>
          }) => string)
    error?: {
        label?: string | DataConstraintPropertyGenerator<Type, ParamsConfig, Label>
        description?: string | DataConstraintPropertyGenerator<Type, ParamsConfig, Label>
    }

    system?: boolean
    types: DataTypeIDs
    supersedes: DataConstraintKey[]
    params?: ParamsConfig

    select?: DataConstraintPropertyGenerator<
        Type,
        ParamsConfig,
        Label,
        { value: string | undefined; direction: "previous" | "next" }
    >

    validate: DataConstraintPropertyGenerator<Type, ParamsConfig, Label, { value: Type }, boolean>
}

type ValidateDC<
    ID extends DataConstraintKey,
    DataTypeIDs extends DataTypeKey[],
    Type extends InferDataType<DataTypeIDs>,
    Label extends "number" | "boolean" | "string",
    ParamsConfig extends ValidateDataConstraintParamsConfig<ParamsConfig>,
    Constraint extends DataConstraint<ID, DataTypeIDs, Type, ParamsConfig, Label> = DataConstraint<
        ID,
        DataTypeIDs,
        Type,
        ParamsConfig,
        Label
    >
> = Constraint

// {
//     [Key in keyof Constraint]: Constraint[Key] extends "label"
//         ? Label extends undefined
//             ? Constraint[Key]
//             : Constraint[Key]
//         : Constraint[Key]
// }

// function getArray<T extends Array<AnyCon>>(cons: [...T]): {
//     [K in keyof T]: T[K] extends AnyCon ? InstanceType<T[K]> : never
// };
// function getArray(cons: AnyCon[]): any[] {
//     return cons.map((c: AnyCon) => new c());
// }

// let [t2, t3]: [T2, T3] = getArray([T2, T3]);

export function createDataConstraint<
    ID extends DataConstraintKey,
    DataTypeIDs extends DataTypeKey[],
    Type extends InferDataType<DataTypeIDs>,
    Label extends "number" | "boolean" | "string",
    ParamsConfig extends ValidateDataConstraintParamsConfig<ParamsConfig>,
    InferOnly extends ValidateDC<ID, DataTypeIDs, Type, Label, ParamsConfig>,
    Result extends Expand<ValidateDC<ID, DataTypeIDs, Type, Label, ParamsConfig>, TypeSchema>
>(props: ValidateDC<ID, DataTypeIDs, Type, Label, ParamsConfig, InferOnly>): Result {
    return props as Result
}
