/**
 *
 */

import { DataConstraint, DataConstraintID, DataConstraintOptions, dataConstraints, SerializableDataConstraint } from ".."
import { parseDataConstraintParameters, resolveGenerator } from "~/domains/shared/utils"

export function configureDataConstraint({ constraint }: { constraint: SerializableDataConstraint }): ConfiguredDataConstraint {
    const constraintDefinitionEntry = Object.entries(dataConstraints).find(([id]) => {
        return id === constraint.id
    })
    if (!constraintDefinitionEntry) throw new Error(`No constraint with cycler found for ${constraint.id}`)

    const [, constraintDefinition] = constraintDefinitionEntry as [
        DataConstraintID,
        DataConstraint<DataConstraintID, DataConstraintOptions>
    ]

    const parameters = constraintDefinition.options
        ? parseDataConstraintParameters(constraintDefinition.options, constraint.parameters)
        : {}

    return {
        id: constraintDefinition.id,
        name: constraintDefinition.name,
        description: resolveGenerator<string>({ value: constraintDefinition.description, params: parameters }),
        label: resolveGenerator({ value: constraintDefinition.label, params: parameters }) ?? constraintDefinition.name,
        instructions: resolveGenerator<string>({ value: constraintDefinition.instructions, params: parameters }),
        error: {
            title:
                resolveGenerator({ value: constraintDefinition.error?.label, params: parameters }) ?? constraintDefinition.name,
            message:
                resolveGenerator({ value: constraintDefinition.error?.description, params: parameters }) ??
                resolveGenerator<string>({ value: constraintDefinition.instructions, params: parameters })
        },
        select: constraintDefinition.select
            ? ({ value, direction }) => {
                  return constraintDefinition.select!({ value, params: parameters, direction })
              }
            : undefined,
        validate: ({ value }) => {
            return constraintDefinition.validate({ value, params: parameters })
        }
    }
}

export type ConfiguredDataConstraint = {
    id: DataConstraintID
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
