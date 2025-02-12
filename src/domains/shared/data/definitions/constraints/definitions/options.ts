/**
 *
 */

import { Expand } from "@sdkit/utils"
import { Type } from "arktype"

export type DataConstraintOption<Schema extends Type = Type> = {
    name: string
    description: string
    required: boolean
} & (
    | {
          type: "group"
          options: DataConstraintOptions<Schema>
      }
    | {
          type: "value"
          schema: Schema
      }
)

export type DataConstraintOptions<Schema extends Type = Type> = Record<string, DataConstraintOption<Schema>>

export type InferSchemaFromOptions<Options extends DataConstraintOptions<Type>> = Expand<{
    [Key in keyof Options]: Options[Key] extends { type: "value"; schema: Type }
        ? Options[Key]["required"] extends true
            ? Options[Key]["schema"]["infer"]
            : Options[Key]["schema"]["infer"] | null
        : Options[Key] extends { type: "group"; options: infer GroupOptions }
          ? Options[Key]["required"] extends true
              ? InferSchemaFromOptions<GroupOptions & DataConstraintOptions<Type>>
              : InferSchemaFromOptions<GroupOptions & DataConstraintOptions<Type>> | null
          : never
}>
