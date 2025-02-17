/**
 *
 */

// Fix this in configured.ts

export function resolveGenerator<Result extends string | undefined, Params extends object = object, Fn = unknown>({
    generator,
    args
}: {
    generator?: Fn
    args: Params
}): Result {
    if (typeof generator === "function") return generator(args)
    return generator as Result
}
