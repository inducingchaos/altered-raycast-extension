/**
 *
 */

// Fix this in configured.ts

export type ResolveGeneratorProps<Result extends string | undefined, Params extends object, Fn> = {
    generator?: Fn
    args: Fn extends (args: infer P) => unknown ? P : never
}

export function resolveGenerator<Result extends string | undefined, Params extends object, Fn>({
    generator,
    args
}: ResolveGeneratorProps<Result, Params, Fn>): Result {
    console.log("LOOKOUT 4", generator?.toString(), args)

    if (typeof generator === "function") {
        const a = generator(args)
        console.log("LOOKOUT 5", a)
        return a
    }
    return generator as Result
}
