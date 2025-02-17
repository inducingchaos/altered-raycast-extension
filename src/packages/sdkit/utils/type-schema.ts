/**
 *
 */

import { type, Type } from "arktype"
import { Expand } from "./expand"

type TypeSchemaPrimitiveMap = {
    string: string
    number: number
    boolean: boolean
    unknown: unknown
}

type TypeSchemaPrimitiveName = Expand<keyof TypeSchemaPrimitiveMap>
type TypeSchemaArrayName = `${TypeSchemaPrimitiveName}[]`
type TypeSchemaName = TypeSchemaPrimitiveName | TypeSchemaArrayName

type InferTypeSchema<Name extends TypeSchemaName> = Name extends `${infer InferredName extends TypeSchemaPrimitiveName}[]`
    ? TypeSchemaPrimitiveMap[InferredName][]
    : Name extends TypeSchemaPrimitiveName
      ? TypeSchemaPrimitiveMap[Name]
      : never

// type TypeSchema<Name extends TypeSchemaName = TypeSchemaName> = {
//     name: Name
//     infer: InferTypeSchema<Name>
// }

// function createTypeSchema<Name extends TypeSchemaName>(name: Name): TypeSchema<Name> {
//     return { name } as TypeSchema<Name>
// }

export type TypeSchema<Name extends TypeSchemaName = TypeSchemaName> = {
    name: Name
    infer: InferTypeSchema<Name>
    definition: Type<InferTypeSchema<Name>>
}

export function createTypeSchema<Name extends TypeSchemaName>(name: Name): TypeSchema<Name> {
    return { name, definition: type(name as Parameters<typeof type>[0]) } as TypeSchema<Name>
}
