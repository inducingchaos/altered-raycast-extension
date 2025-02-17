/**
 *
 */

import { parseDataConstraintParameters, resolveGenerator } from "~/domains/shared/utils"
import { DataConstraint, DataConstraintID, DataConstraintKey, DataConstraintParams, dataConstraints } from ".."

export function configureDataConstraint({
    id,
    parameters
}: {
    id: DataConstraintKey | DataConstraintID
    parameters: DataConstraintParams
}): ConfiguredDataConstraint {
    // console.log(id)
    const constraintDefinitionEntry = Object.entries(dataConstraints).find(([constraintId]) => {
        return constraintId === id
    })
    // console.log(constraintDefinitionEntry)
    if (!constraintDefinitionEntry) throw new Error(`No constraint with cycler found for ${id}`)

    const [, constraintDefinition] = constraintDefinitionEntry as [DataConstraintKey, DataConstraint<DataConstraintKey>]

    // console.log(constraintDefinition.params, constraintDefinition.id, constraintDefinition.name, parameters)
    const parsedParams = constraintDefinition.params
        ? parseDataConstraintParameters(constraintDefinition.params, parameters)
        : {}

    console.log("BEFORE FINISH", parsedParams)

    const a: ConfiguredDataConstraint = {
        id: constraintDefinition.id,
        name: constraintDefinition.name,
        description: resolveGenerator({
            generator: constraintDefinition.description,
            args: { constraint: constraintDefinition, params: parsedParams }
        }),
        label:
            resolveGenerator({
                generator: constraintDefinition.label,
                args: { constraint: constraintDefinition, params: parsedParams }
            }) ?? constraintDefinition.name,
        instructions: resolveGenerator({
            generator: constraintDefinition.instructions,
            args: { constraint: constraintDefinition, params: parsedParams }
        }),
        error: {
            title:
                resolveGenerator({
                    generator: constraintDefinition.error?.label,
                    args: { constraint: constraintDefinition, params: parsedParams }
                }) ?? constraintDefinition.name,
            message:
                resolveGenerator({
                    generator: constraintDefinition.error?.description,
                    args: { constraint: constraintDefinition, params: parsedParams }
                }) ??
                resolveGenerator({
                    generator: constraintDefinition.instructions,
                    args: { constraint: constraintDefinition, params: parsedParams }
                })
        },
        select: constraintDefinition.select
            ? ({ value, direction }) => {
                  return constraintDefinition.select!({
                      constraint: constraintDefinition,
                      value,
                      params: parsedParams,
                      direction
                  })
              }
            : undefined,
        validate: ({ value }) => {
            return constraintDefinition.validate({ constraint: constraintDefinition, value, params: parsedParams }) ?? true
        }
    }

    console.log("AFTER FINISH", a)

    return a
}

export type ConfiguredDataConstraint = {
    id: DataConstraintKey
    name: string
    description: string
    label: string
    instructions: string
    error: {
        title: string
        message: string
    }
    select?: (props: { value: string | undefined; direction: "previous" | "next" }) => string
    validate: (props: { value: string }) => boolean
}
