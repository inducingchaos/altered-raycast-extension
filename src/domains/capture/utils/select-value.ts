// /**
//  *
//  */

// const selectEnumValue = ({
//     forItem: item,
//     inDirection: direction
// }: {
//     forItem: CaptureItem
//     inDirection: "next" | "previous"
// }) => {
//     if (item.type.id !== "enum") return
//     const options = item.type.options

//     // const currentValue = captureItemsState[item.id].value
//     const currentValue = selectedItem.value
//     const currentIndex = options.indexOf(currentValue ?? options[0])
//     const noIndex = currentIndex === -1

//     const offset = direction === "next" ? 1 : options.length - 1
//     const offsetIndex = (currentIndex + offset) % options.length
//     const nextValue = options[noIndex ? 0 : offsetIndex]

//     setCaptureItemsState(prev => ({ ...prev, [item.id]: { value: nextValue, error: null } }))
//     // setSearchText(nextValue)
// }

// export function selectItem<Value, ForeignValue>({
//     fromOptions: options,
//     usingCurrentValue: currentValue,
//     andDefaultValue: defaultValue,
//     inDirection: direction
// }: {
//     fromOptions: Value[]
//     usingCurrentValue: Value | ForeignValue
//     andDefaultValue: Value
//     inDirection: "next" | "previous"
// }) {
//     const value = captureItemsState[item.id].value
//     let numberValue = value ? parseInt(value) : 0
//     if (isNaN(numberValue)) numberValue = 0
//     const isInteger = Math.round(numberValue) === numberValue

//     const newValue =
//         direction === "increase"
//             ? isInteger
//                 ? numberValue + 1
//                 : Math.ceil(numberValue)
//             : isInteger
//               ? numberValue - 1
//               : Math.floor(numberValue)

//     setCaptureItemsState(prev => ({ ...prev, [item.id]: { value: newValue.toString(), error: null } }))
// }
