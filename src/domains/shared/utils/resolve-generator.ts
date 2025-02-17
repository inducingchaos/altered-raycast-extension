/**
 *
 */

// Fix this in configured.ts

export type ResolveGeneratorProps<Fn, Result> = {
    generator?: Fn
    args: Fn extends (args: infer P) => Result ? P : never
}

export function resolveGenerator<Fn, Result>({ generator, args }: ResolveGeneratorProps<Fn, Result>): Result {
    console.log("LOOKOUT 4", generator?.toString(), args)

    if (typeof generator === "function") {
        const a = generator(args)
        console.log("LOOKOUT 5", a)
        return a
    }
    return generator as Result
}
