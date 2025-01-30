import { SafeParseReturnType, z, ZodSchema } from "zod"

/**
 * Base interface for anything that validates and displays validation info
 */
export type ValidationRule<OptionsSchema extends ZodSchema = ZodSchema, Options = z.infer<OptionsSchema>> = {
    name: string
    description: string
    options: OptionsSchema
    info: {
        label: string | ((options: Options) => string)
        description: string | ((options: Options) => string)
        error?: {
            label?: string | ((options: Options) => string)
            description?: string | ((options: Options) => string)
        }
    }
    validate: (options: Options) => (value: string) => SafeParseReturnType<OptionsSchema, Options>
}
