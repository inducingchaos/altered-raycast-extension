/**
 *
 */

export function resolveGenerator<
    Result extends string | undefined,
    Params extends object = object,
    Fn extends (params: Params) => Result = (params: Params) => Result
>({ value, params }: { value: Result | Fn; params: Params }): Result {
    if (typeof value === "function") return (value as Fn)(params)
    return value
}
