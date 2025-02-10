// /**
//  *
//  */

// import { Action, Icon } from "@raycast/api"
// import { FormSchema } from "@sdkit/domains/raycast/meta"

// export type SelectRowActionProps = {
//     direction: "next" | "previous"
//     schema: FormSchema
//     state: {
//         selectedRow: {
//             id: string
//             updatedAt: number
//             set: (id: string) => void
//         }
//     }
// }

// // should be done in the setter

// // onSelectionChange({
// //     selectedItemIdUpdatedAt,
// //     selectedItemId: rows[nextIndex]?.id,
// //     setSelectedItemId
// // })

// function selectRow({ direction, schema, state }: SelectRowActionProps): void {
//     const currentIndex = schema.rows.findIndex(row => row.id === state.selectedRow.id)
//     const offset = direction === "next" ? 1 : -1 + schema.rows.length
//     const nextIndex = (currentIndex + offset) % schema.rows.length

//     state.selectedRow.set(schema.rows[nextIndex].id!)
// }

// export function SelectRowAction({ direction, schema, state }: SelectRowActionProps): JSX.Element {
//     return (
//         <Action
//             title={direction === "next" ? "Next" : "Previous"}
//             icon={direction === "next" ? Icon.ArrowRight : Icon.ArrowLeft}
//             shortcut={{ modifiers: direction === "next" ? [] : ["shift"], key: "tab" }}
//             onAction={() => selectRow({ direction, schema, state })}
//         />
//     )
// }
