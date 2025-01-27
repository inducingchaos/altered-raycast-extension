/**
 *
 */

export type KebabCaseToCamelCase<Value extends string> = Value extends `${infer First}-${infer Rest}`
    ? `${First}${Capitalize<KebabCaseToCamelCase<Rest>>}`
    : Value
