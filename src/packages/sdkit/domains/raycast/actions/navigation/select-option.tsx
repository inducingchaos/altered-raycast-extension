/**
 *
 */

import { Action, Icon } from "@raycast/api"
import { DataStore } from "~/domains/capture/types"
import { dataTypes, SafeDataSchema } from "~/domains/shared/data"
import {
    DataConstraintID,
    DataConstraint,
    dataConstraints,
    DataConstraintOptions
} from "~/domains/shared/data/definitions/constraints"
import { parseDataConstraintParameters } from "~/domains/shared/utils/test"

// fix bug where you cant escape if you select option before typing

export type SelectOptionActionProps = {
    direction: "next" | "previous"
    schema: SafeDataSchema
    state: {
        store: {
            value: DataStore
            set: (value: (prev: DataStore) => DataStore) => void
        }
        selection: {
            id: string | undefined
        }
    }
}

export function SelectOptionAction({ direction, schema, state }: SelectOptionActionProps): JSX.Element {
    return (
        <Action
            title={direction === "next" ? "Next Option" : "Previous Option"}
            icon={direction === "next" ? Icon.ArrowRightCircle : Icon.ArrowLeftCircle}
            shortcut={{ modifiers: direction === "next" ? ["ctrl"] : ["shift", "ctrl"], key: "tab" }}
            onAction={() => oldSelectOption({ direction, schema, state })}
        />
    )
}

// const selectOption = ({ direction, schema, state }: SelectOptionActionProps) => {
//     //  Get the type, so we can get the options, and get possible options off schema

//     const { options } = schema.items.find(item => item.id === state.selection.id)

//     navigateArray({
//         source: schema.items,
//         current: ({ id }) => id === state.selection.id,
//         direction
//     })
//     selectOption({
//         inDirection: "next",
//         columns,
//         dataStore,
//         setDataStore,
//         selectedItemId: state.selection.id
//     })
// }

function oldSelectOption({
    direction,
    schema,
    state: {
        store,
        selection: { id: selectionId }
    }
}: SelectOptionActionProps) {
    if (!selectionId) return
    const currentValue = store.value.get(selectionId)?.value

    const column = schema.columns.find(column => column.id === selectionId)
    if (!column) throw new Error(`Column with id ${selectionId} not found`)

    const serializableConstraintIds = column.constraints?.map(constraint => constraint.id) ?? []

    // Find both the constraint definition and its serialized instance together
    const constraintPair = Object.entries(dataConstraints).find(([id, constraint]) => {
        return serializableConstraintIds.includes(id as DataConstraintID) && constraint.select
    })
    if (!constraintPair) throw new Error(`No constraint with cycler found for ${serializableConstraintIds}`)

    const [constraintId, constraint] = constraintPair as [
        DataConstraintID,
        DataConstraint<DataConstraintID, DataConstraintOptions>
    ]
    const serializableConstraint = column.constraints?.find(c => c.id === constraintId)
    if (!serializableConstraint) throw new Error(`No parameters found for constraint ${constraintId}`)

    const optionsSchema = constraint.options
    if (!optionsSchema) throw new Error(`No options schema found for constraint ${constraintId}`)

    // Since we know these types align at runtime, we can safely assert the type
    const parsedParameters = parseDataConstraintParameters(optionsSchema, serializableConstraint.parameters)

    if (constraint.select) {
        // We know these parameters match the constraint's expected type
        type Params = Parameters<typeof constraint.select>[1]
        const nextValue = constraint.select(currentValue, parsedParameters as Params, direction)
        store.set(prev => prev.set(selectionId, { value: nextValue, errors: [] }))
        return
    }

    // logic for just boolean - replace with dynamic
    if (schema.columns.find(column => column.id === selectionId)?.type !== dataTypes.boolean.id) return

    const nextValue =
        direction === "next"
            ? currentValue?.toLowerCase() === "true"
                ? "False"
                : "True"
            : currentValue?.toLowerCase() === "false"
              ? "True"
              : "False"

    store.set(prev => prev.set(selectionId, { value: nextValue, errors: [] }))
}
