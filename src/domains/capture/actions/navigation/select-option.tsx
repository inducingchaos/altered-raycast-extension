/**
 *
 */

import { Action, Icon } from "@raycast/api"
import { dataTypes, SafeDataSchema } from "~/domains/shared/data"
import { configureDataConstraint, DataConstraintKey, dataConstraints } from "~/domains/shared/data/definitions/constraints"
import { useCapture } from "../../components/context"
import { CaptureContextState } from "../../components/context/state"

// fix bug where you cant escape if you select option before typing

export function SelectOptionAction({ direction }: { direction: "next" | "previous" }): JSX.Element {
    const { state, schema } = useCapture()

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
    state
}: {
    direction: "next" | "previous"
    schema: SafeDataSchema
    state: CaptureContextState["state"]
}) {
    if (!state.selection.id) return

    const value = state.store.value.get(state.selection.id)?.value
    const column = schema.columns.find(column => column.id === state.selection.id)

    const constraintIds = column?.constraints?.map(constraint => constraint.id) ?? []
    const [constraintId] =
        Object.entries(dataConstraints).find(
            ([id, constraint]) => constraintIds.includes(id as DataConstraintKey) && constraint.select
        ) ?? []
    const constraint = column?.constraints?.find(c => constraintId === c.id)

    const { select } = constraint ? configureDataConstraint({ ...constraint }) : {}
    if (select) {
        const nextValue = select({ value, direction })

        // state.store.set(prev => prev.set(state.selection.id, { value: nextValue, errors: [] }))

        state.content.set(nextValue)

        return
    }

    const type = Object.values(dataTypes).find(type => type.id === column?.type)

    if (type?.select) {
        const nextValue = type.select({ value, direction })

        // store.set(prev => prev.set(selectionId, { value: nextValue, errors: [] }))
        state.content.set(nextValue)
    }

    return

    // // logic for just boolean - replace with dynamic
    // if (schema.columns.find(column => column.id === selectionId)?.type !== dataTypes.boolean.id) return

    // const nextValue =
    //     direction === "next"
    //         ? currentValue?.toLowerCase() === "true"
    //             ? "False"
    //             : "True"
    //         : currentValue?.toLowerCase() === "false"
    //           ? "True"
    //           : "False"

    // store.set(prev => prev.set(selectionId, { value: nextValue, errors: [] }))
}
