/**
 *
 */

import { Expand } from "@sdkit/utils"
import { TypeSchema } from "@sdkit/utils"

// export type DataConstraintOption<Schema extends Type = Type> = {
//     name: string
//     description: string
//     required: boolean
// } & (
//     | {
//           type: "group"
//           options: DataConstraintOptions<Schema>
//       }
//     | {
//           type: "value"
//           schema: Schema
//           //  Since we are not hoisting the `Schema` generic to the creation function (doing so would inhibit separate sibling schemas during definition), the default may not be of type `Schema["infer"]`. We should always verify the default at runtime.
//           default?: Schema["infer"]
//       }
// )

// export type DataConstraintOptions<Schema extends Type = Type> = Record<string, DataConstraintOption<Schema>>

// export type InferSchemaFromOptions<Options extends DataConstraintOptions<Type>> = Expand<{
//     [Key in keyof Options]: Options[Key] extends { type: "value"; schema: Type }
//         ? Options[Key]["required"] extends true
//             ? Options[Key]["schema"]["infer"]
//             : Options[Key]["schema"]["infer"] | null
//         : Options[Key] extends { type: "group"; options: infer GroupOptions }
//           ? Options[Key]["required"] extends true
//               ? InferSchemaFromOptions<GroupOptions & DataConstraintOptions<Type>>
//               : InferSchemaFromOptions<GroupOptions & DataConstraintOptions<Type>> | null
//           : never
// }>

type DataConstraintParamConfigBase = { name: string; description: string }

type ValueDataConstraintParamConfigBase = { type: "value"; schema: TypeSchema }
type OptionalValueDataConstraintParamConfig = DataConstraintParamConfigBase &
    ValueDataConstraintParamConfigBase & { required: false; default: TypeSchema["infer"] | null }
type RequiredValueDataConstraintParamConfig = DataConstraintParamConfigBase &
    ValueDataConstraintParamConfigBase & { required: true }
type ValueDataConstraintParamConfig = OptionalValueDataConstraintParamConfig | RequiredValueDataConstraintParamConfig

type GroupDataConstraintParamConfig = DataConstraintParamConfigBase & {
    type: "group"
    required: boolean
    options: Record<string, DataConstraintParamConfig>
}

export type DataConstraintParamConfig = ValueDataConstraintParamConfig | GroupDataConstraintParamConfig
export type DataConstraintParamsConfig = Record<string, DataConstraintParamConfig>
export type NullableDataConstraintParamsConfig = DataConstraintParamsConfig | null

/**
 * Re-maps the named keys of the parameter configurations to their respective inferred values.
 */
export type InferDataConstraintParams<Params extends NullableDataConstraintParamsConfig> = Expand<{
    [Key in keyof Params]: Params[Key] extends ValueDataConstraintParamConfig
        ? Params[Key]["required"] extends true
            ? Params[Key]["schema"]["infer"]
            : Params[Key]["schema"]["infer"] | null
        : Params[Key] extends GroupDataConstraintParamConfig
          ? Params[Key]["required"] extends true
              ? InferDataConstraintParams<Params[Key]["options"]>
              : InferDataConstraintParams<Params[Key]["options"]> | null
          : never
}>

type ValidateDataConstraintParamConfig<Param extends DataConstraintParamConfig> = Param extends ValueDataConstraintParamConfig
    ? Param extends RequiredValueDataConstraintParamConfig
        ? Omit<Param, "default"> & { default?: `\`never\` when \`required\` is set to \`true\`` }
        : Omit<ValueDataConstraintParamConfig, "default"> & { default: Param["schema"]["infer"] | null }
    : Param extends GroupDataConstraintParamConfig
      ? Omit<GroupDataConstraintParamConfig, "options"> & { options: ValidateDataConstraintParamsConfig<Param["options"]> }
      : DataConstraintParamConfig

/**
 * Recursively validates all parameter configurations.
 */
export type ValidateDataConstraintParamsConfig<Params extends DataConstraintParamsConfig> = {
    [Key in keyof Params]: ValidateDataConstraintParamConfig<Params[Key]>
}
