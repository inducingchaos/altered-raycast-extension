/**
 *
 */

/**
 * Expands branded types for better readability. Preserves built-in types.
 */
export type Expand<Type, Except = never> = Type extends Except
    ? Type
    : Type extends Array<infer Item>
      ? Array<Expand<Item, Except>>
      : Type extends (...args: never[]) => unknown
        ? Type
        : Type extends Date
          ? Date
          : Type extends RegExp
            ? RegExp
            : Type extends Map<infer Key, infer Value>
              ? Map<Expand<Key, Except>, Expand<Value, Except>>
              : Type extends Set<infer Item>
                ? Set<Expand<Item, Except>>
                : Type extends object
                  ? {
                        [Key in keyof Type as Key extends string ? (string extends Key ? never : Key) : Key]: Expand<
                            Type[Key],
                            Except
                        >
                    }
                  : Type

//  Drop-in replacement to mock the behavior of an ArkType `Type`, for demonstration purposes.

type DynamicTypePrimitiveMap = {
    string: string
    number: number
    boolean: boolean
    unknown: unknown
}

type DynamicTypePrimitiveName = Expand<keyof DynamicTypePrimitiveMap>
type DynamicTypeArrayName = `${DynamicTypePrimitiveName}[]`
type DynamicTypeName = DynamicTypePrimitiveName | DynamicTypeArrayName

type InferDynamicType<Name extends DynamicTypeName> = Name extends `${infer InferredName extends DynamicTypePrimitiveName}[]`
    ? DynamicTypePrimitiveMap[InferredName][]
    : Name extends DynamicTypePrimitiveName
      ? DynamicTypePrimitiveMap[Name]
      : never

type DynamicType<T extends DynamicTypeName = DynamicTypeName> = {
    name: T
    infer: InferDynamicType<T>
}

function createDynamicType<T extends DynamicTypeName>(name: T): DynamicType<T> {
    return { name } as DynamicType<T>
}

//  Types for the `DataConstraint` parameter configurations.

type DataConstraintParamConfigBase = { name: string; description: string }

type ValueDataConstraintParamConfigBase = { type: "value"; schema: DynamicType }
type OptionalValueDataConstraintParamConfig = DataConstraintParamConfigBase &
    ValueDataConstraintParamConfigBase & { required: false; default: DynamicType["infer"] | null }
type RequiredValueDataConstraintParamConfig = DataConstraintParamConfigBase &
    ValueDataConstraintParamConfigBase & { required: true }
type ValueDataConstraintParamConfig = OptionalValueDataConstraintParamConfig | RequiredValueDataConstraintParamConfig

type GroupDataConstraintParamConfig = DataConstraintParamConfigBase & {
    type: "group"
    required: boolean
    options: Record<string, DataConstraintParamConfig>
}

type DataConstraintParamConfig = ValueDataConstraintParamConfig | GroupDataConstraintParamConfig
type DataConstraintParamsConfig = Record<string, DataConstraintParamConfig>

/**
 * Re-maps the named keys of the parameter configurations to their respective inferred values.
 */
type InferDataConstraintParams<Params extends DataConstraintParamsConfig> = Expand<{
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

//  The core constraint configuration.

type DataConstraintConfig<
    ParamsConfig extends DataConstraintParamsConfig = DataConstraintParamsConfig,
    Type extends DynamicType = DynamicType,
    Params = InferDataConstraintParams<ParamsConfig>
> = {
    name: string
    type: Type
    params: ParamsConfig
    label?: (props: { config: DataConstraintConfig<ParamsConfig, Type, Params>; params: Params }) => string
    instructions?: (props: { config: DataConstraintConfig<ParamsConfig, Type, Params>; params: Params }) => string
    validate?: (props: {
        config: DataConstraintConfig<ParamsConfig, Type, Params>
        params: Params
    }) => (value: Type["infer"]) => boolean
}

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
type ValidateDataConstraintParamsConfig<Params extends DataConstraintParamsConfig> = {
    [Key in keyof Params]: ValidateDataConstraintParamConfig<Params[Key]>
}

function createDataConstraintConfig<
    Type extends DynamicType,
    Params extends ValidateDataConstraintParamsConfig<Params>,
    Result extends Expand<DataConstraintConfig<Params, Type>, DynamicType>
>(props: DataConstraintConfig<Params, Type>): Result {
    return props as Result
}

//  The implementation.

export const enumConstraintConfig = createDataConstraintConfig({
    name: "Enum",
    type: createDynamicType("string"),
    params: {
        options: {
            name: "Options",
            description: "The allowed options for the value. ",
            type: "value",
            required: true,
            schema: createDynamicType("string[]")
        },
        caseSensitive: {
            name: "Case Sensitive",
            description: "Whether the options should be case sensitive.",
            type: "value",
            required: false,
            schema: createDynamicType("boolean"),
            default: true
        },
        multipleOptions: {
            name: "Multiple Options",
            description: "Whether more than one option can be specified.",
            type: "group",
            required: false,
            options: {
                limit: {
                    name: "Limit",
                    description: "The maximum number of options that can be specified.",
                    type: "value",
                    required: false,
                    schema: createDynamicType("number"),
                    default: 1
                },
                separators: {
                    name: "Separators",
                    description: "The allowed delimiters for separating the options.",
                    type: "value",
                    required: false,
                    schema: createDynamicType("string[]"),
                    default: [", ", " "]
                }
            }
        }
    },
    label: ({ config, params }) => `${config.name}: ${params.options.join(", ")}`,
    instructions: ({ config, params }) =>
        `The value can contain ${params.multipleOptions?.limit ? `up to ${params.multipleOptions?.limit}` : params.multipleOptions?.limit === 1 ? "one" : "any"} of the following options${params.multipleOptions?.limit ? `, separated by '${(params.multipleOptions?.separators ?? config.params.multipleOptions.options.separators.default).join("', '")}'` : ""}: ${params.options.join(", ")}`,
    validate:
        ({ config, params }) =>
        value => {
            const separators = params.multipleOptions?.separators ?? config.params.multipleOptions.options.separators.default
            const options = separators.flatMap(separator => value.split(separator))
            const casedOptions = params.caseSensitive ? options : options.map(option => option.toLowerCase())

            const allowedOptions = params.options
            const casedAllowedOptions = params.caseSensitive
                ? allowedOptions
                : allowedOptions.map(option => option.toLowerCase())

            const isMatching = casedOptions.every(option => casedAllowedOptions.includes(option))

            const limit = params.multipleOptions?.limit ?? config.params.multipleOptions.options.limit.default
            const isLimitReached = !!limit && options.length > limit

            return isMatching && !isLimitReached
        }
})
