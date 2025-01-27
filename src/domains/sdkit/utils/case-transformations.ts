/**
 *
 */

export type KebabToCamelCase<Value extends string> = Value extends `${infer Char}${"-"}${infer Rest}`
    ? `${Char}${Capitalize<KebabToCamelCase<Rest>>}`
    : Value
