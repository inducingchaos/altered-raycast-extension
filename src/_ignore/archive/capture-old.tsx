/**
 *
 */

import { Action, ActionPanel, closeMainWindow, Color, Icon, List, showToast, Toast } from "@raycast/api"
import { getProgressIcon } from "@raycast/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import { setTimeout } from "timers/promises"

const MINIMAL_MODE = true

export type CaptureItemAccessoryOptions = {
    searchText: string | undefined
}

export type CaptureItemAccessory = (options: CaptureItemAccessoryOptions) => List.Item.Accessory

const captureItemsErrors = [
    {
        id: "exceeds-max-length",
        label: "Exceeds Max Length",
        description: "The content must be 255 characters or less."
    },
    {
        id: "cannot-be-empty",
        label: "Required",
        description: "The content cannot be empty."
    },
    {
        id: "incorrect-type",
        label: "Incorrect Type",
        description: "NO DESCRIPTION"
    }
] as const

type CaptureItemsErrorID = (typeof captureItemsErrors)[number]["id"]

export type CaptureItemValidator = {
    condition: (value: string) => boolean
    id: CaptureItemsErrorID
    label?: string
    description?: string
}

export type StandardCaptureItemTypeID = "string" | "number" | "boolean" | "date"
export type CustomCaptureItemTypeID = "enum" | "range"
export type CaptureItemTypeID = StandardCaptureItemTypeID | CustomCaptureItemTypeID

export type CaptureItemType = {
    name: string
}

export const captureItemTypes: Record<CaptureItemTypeID, CaptureItemType> = {
    string: {
        name: "Text"
    },
    number: {
        name: "Number"
    },
    boolean: {
        name: "True/False"
    },
    date: {
        name: "Date"
    },
    enum: {
        name: "Select"
    },
    range: {
        name: "Range"
    }
} as const

export type CaptureItem = {
    id: CaptureItemID
    icon?: Icon
    type:
        | {
              id: StandardCaptureItemTypeID
          }
        | {
              id: "enum"
              options: string[]
          }
        | {
              id: "range"
              min: number
              max: number
              interval: number
          }

    label: string
    description: string
    accessories?: CaptureItemAccessory[]
    validators?: CaptureItemValidator[]
}

export const captureItems: CaptureItem[] = [
    {
        id: "alias",
        type: { id: "string" },
        label: "Alias",
        description: "A name for your thought."
        // accessories: () => [
        //     // { text: `An Accessory Text`, icon: Icon.Hammer },
        //     // { text: { value: `A Colored Accessory Text`, color: Color.Orange }, icon: Icon.Hammer },
        //     // { icon: Icon.Person, tooltip: "A person" },
        //     // { text: "Just Do It!" }
        //     // { date: new Date() },
        //     // { tag: new Date() },
        //     // { tag: { value: new Date(), color: Color.Magenta } },
        //     // { tag: { value: "User", color: Color.Magenta }, tooltip: "Tag with tooltip" }
        // ]
    },
    {
        id: "content",
        type: { id: "string" },
        label: "Content",
        description: "The description of your thought.",
        accessories: [
            // ({ searchText }) => ({
            //     text: {
            //         value: `${searchText.length}`,
            //         color:
            //             searchText.length > 255
            //                 ? Color.Red
            //                 : searchText.length > 223
            //                   ? Color.Orange
            //                   : searchText.length > 191
            //                     ? Color.Yellow
            //                     : Color.SecondaryText
            //     }
            // }),
            ({ searchText }) => ({
                tag: {
                    value: `${searchText?.length ?? 0}/16`,
                    color: Color.SecondaryText
                },
                tooltip: "The number of characters in your thought."
            }),
            ({ searchText }) => ({
                text: {
                    value: ` `
                    // color: Color.Orange
                },
                icon:
                    (searchText?.length ?? 0) > 15
                        ? {
                              source: Icon.XMarkCircleFilled,
                              tintColor: Color.Red
                          }
                        : getProgressIcon((searchText?.length ?? 0) / 15, Color.PrimaryText, {
                              background: Color.PrimaryText,
                              backgroundOpacity: 0.125
                          }),
                tooltip: "The number of characters in your thought."
            })
            // ({ searchText }) => ({
            //     text: {
            //         value: `TEST`
            //         // color: Color.Orange
            //     },
            //     icon: {
            //         source: Icon.Circle,
            //         tintColor: Color.Red
            //     }
            // })
        ],

        validators: [
            {
                id: "exceeds-max-length",
                condition: value => value.length >= 16,
                description: "Thought content must be less than 16 characters or less."
            }
        ]
    },
    {
        id: "priority",
        type: { id: "number" },
        label: "Priority",
        description: "Level of significance.",
        validators: [
            {
                id: "incorrect-type",
                condition: value => isNaN(parseInt(value)),
                description: "Priority must be a number."
            }
        ]
    },
    {
        id: "attachment",
        type: { id: "enum", options: ["Image", "Video", "Audio", "File"] },
        label: "Attachment",
        description: "A related asset."
    },
    {
        id: "tags",
        type: { id: "string" },
        label: "Tags",
        description: "Categories for indexing.",
        validators: [
            {
                id: "cannot-be-empty",
                condition: value => value.trim() === "",
                description: "The tags cannot be empty."
            }
        ]
    },
    {
        id: "urgency",
        type: { id: "range", min: 0, max: 10, interval: 1 },
        label: "Urgency",
        description: "How urgent this thought is.",
        validators: [
            {
                // replace with real range validator
                id: "incorrect-type",
                condition: value => {
                    const number = parseInt(value)

                    const isInRange = number >= 0 && number <= 10
                    const isInteger = Math.round(number) === number

                    return !isInRange || !isInteger
                },
                description: "Urgency be in the range."
            }
        ]
    }
]

type CaptureItemsStateItemError = {
    type: "validation"
    id: CaptureItemsErrorID
}

type CaptureItemsStateItem = {
    value?: string
    error: CaptureItemsStateItemError | null
}

type CaptureItemsState = {
    content: CaptureItemsStateItem
    alias: CaptureItemsStateItem
    priority: CaptureItemsStateItem
    attachment: CaptureItemsStateItem
    tags: CaptureItemsStateItem
    urgency: CaptureItemsStateItem
}

type CaptureItemID = keyof CaptureItemsState

// DONE
const initialCaptureItemsState: CaptureItemsState = {
    content: { error: null },
    alias: { error: null },
    priority: { error: null },
    attachment: { error: null },
    tags: { error: null },
    urgency: { error: null }
}

export default function Command() {
    // const [searchText, setSearchText] = useState("")
    const [selectedItemId, setSelectedItemId] = useState<CaptureItemID>(captureItems[0].id)
    // const [isSettingSelection, setIsSettingSelection] = useState<boolean>(false)
    const lastRenderTime = useRef(0)
    // const lastSearchTextChangeTime = useRef(0)

    // DONE
    const [captureItemsState, setCaptureItemsState] = useState<CaptureItemsState>(initialCaptureItemsState)

    const selectedItem = useMemo(() => captureItemsState[selectedItemId], [captureItemsState[selectedItemId], selectedItemId])

    const [selectionChangeCount, setSelectionChangeCount] = useState(0)

    useEffect(() => {
        console.log("Selection Changed (in `useEffect`):", selectedItemId, "Count:", selectionChangeCount)
    }, [selectedItemId])

    const getAccessories = ({
        field,
        value,
        error: currentError
    }: {
        field: CaptureItem
        value?: string
        error: CaptureItemsStateItemError | null
    }) => {
        const isEmpty = !value || value.trim() === ""

        const accessories =
            selectedItemId !== field.id && !isEmpty
                ? [{ text: value }]
                : selectedItemId === field.id && field.accessories
                  ? field.accessories.map(accessory => accessory({ searchText: selectedItem.value }))
                  : []

        if (currentError && selectedItemId !== field.id) {
            const { label, description } = captureItemsErrors.find(error => error.id === currentError.id)!

            accessories.unshift({ tag: { value: label, color: Color.Red }, tooltip: description })
        } else if (selectedItemId !== field.id && !isEmpty) {
            // accessories.unshift({
            //     text: {
            //         value: ``
            //         // color: Color.Orange
            //     },
            //     icon: Icon.WrenchScrewdriver,
            //     tooltip: "The number of characters in your thought."
            // })
        }

        if (selectedItemId === field.id && field.type.id === "enum") {
            const captureItem = captureItems.find(item => item.id === field.id)
            if (captureItem?.type.id !== "enum") return accessories

            const selectorAccessories = [
                {
                    text: {
                        value: "",
                        color: Color.SecondaryText
                    },
                    icon: Icon.ChevronLeft
                },
                {
                    tag: {
                        value: captureItem.type.options.find(option => option === selectedItem.value) ?? field.type.options[0],
                        color: Color.PrimaryText
                    }
                },
                {
                    text: {
                        value: "",
                        color: Color.SecondaryText
                    },
                    icon: Icon.ChevronRight
                },
                {
                    text: {
                        value: "",
                        color: Color.SecondaryText
                    }
                }
            ] satisfies List.Item.Accessory[]

            accessories.unshift(...selectorAccessories)
        }

        if (selectedItemId === field.id && field.type.id === "number") {
            const captureItem = captureItems.find(item => item.id === field.id)
            if (captureItem?.type.id !== "number") return accessories

            // const tagValue =
            //     captureItem.type.options.find(
            //         option => option === captureItemsState[field.id as keyof CaptureItemsState].value
            //     ) ?? field.type.options[0]

            const selectorAccessories = [
                {
                    text: {
                        value: "",
                        color: Color.SecondaryText
                    },
                    icon: Icon.ChevronDown
                },
                {
                    tag: {
                        value: captureItemsState[field.id].value ?? "0",
                        color: Color.PrimaryText
                    }
                },
                {
                    text: {
                        value: "",
                        color: Color.SecondaryText
                    },
                    icon: Icon.ChevronUp
                },
                {
                    text: {
                        value: "",
                        color: Color.SecondaryText
                    }
                }
            ] satisfies List.Item.Accessory[]

            accessories.unshift(...selectorAccessories)
        }

        return accessories
    }

    const selectEnumValue = ({
        forItem: item,
        inDirection: direction
    }: {
        forItem: CaptureItem
        inDirection: "next" | "previous"
    }) => {
        if (item.type.id !== "enum") return
        const options = item.type.options

        // const currentValue = captureItemsState[item.id].value
        const currentValue = selectedItem.value
        const currentIndex = options.indexOf(currentValue ?? options[0])
        const noIndex = currentIndex === -1

        const offset = direction === "next" ? 1 : options.length - 1
        const offsetIndex = (currentIndex + offset) % options.length
        const nextValue = options[noIndex ? 0 : offsetIndex]

        setCaptureItemsState(prev => ({ ...prev, [item.id]: { value: nextValue, error: null } }))
        // setSearchText(nextValue)
    }

    const adjustNumberValue = ({
        forItem: item,
        inDirection: direction
    }: {
        forItem: CaptureItem
        inDirection: "increase" | "decrease"
    }) => {
        if (item.type.id !== "range" && item.type.id !== "number") return
        // const { min, max, interval } = item.type

        const value = captureItemsState[item.id].value
        let numberValue = value ? parseInt(value) : 0
        if (isNaN(numberValue)) numberValue = 0
        const isInteger = Math.round(numberValue) === numberValue

        const newValue =
            direction === "increase"
                ? isInteger
                    ? numberValue + 1
                    : Math.ceil(numberValue)
                : isInteger
                  ? numberValue - 1
                  : Math.floor(numberValue)

        setCaptureItemsState(prev => ({ ...prev, [item.id]: { value: newValue.toString(), error: null } }))
    }

    // const validateCaptureItemValues = (): void => {
    //     captureItems.forEach(item =>
    //         item.validators?.forEach(validator => {
    //             const value = captureItemsState[item.id as keyof CaptureItemsState].value
    //             if (value !== undefined && validator.condition(value))
    //                 setCaptureItemsState(prev => ({
    //                     ...prev,
    //                     [item.id]: { ...prev[item.id], error: { type: "validation", id: validator.id } }
    //                 }))
    //             else setCaptureItemsState(prev => ({ ...prev, [item.id]: { ...prev[item.id], error: null } }))
    //         })
    //     )
    // }

    const [searchTextChanges, setSearchTextChanges] = useState(0)

    // useLayoutEffect(() => {
    //     console.log("validateCaptureItemValues")
    //     validateCaptureItemValues()
    // }, [...Object.values(captureItemsState).map(item => item.value)])

    // const getAccessoriesCallback = useCallback(getAccessories, [captureItemsState, selectedItem])

    // cant have dynamic accessories as any change will reset

    return (
        <List
            onSearchTextChange={text => {
                console.log("Search Text Changed", searchTextChanges + 1)
                setSearchTextChanges(prev => prev + 1)
                // lastSearchTextChangeTime.current = Date.now()

                setCaptureItemsState(prev => ({ ...prev, [selectedItemId]: { value: text, error: null } }))
            }}
            onSelectionChange={id => {
                setSelectionChangeCount(prev => prev + 1)
                console.log("Selection Changed (in `onSelectionChange`):", id, "Count:", selectionChangeCount)
                const now = Date.now()
                if (now - lastRenderTime.current < 25) return
                lastRenderTime.current = now

                if (!id) throw new Error("Null ID passed from Raycast - this is an unhandled edge case.")

                // if (id === selectedItemId) return
                // if (isSettingSelection) return setIsSettingSelection(false)

                // setIsSettingSelection(true)
                setSelectedItemId(id as CaptureItemID)
            }}
            searchText={selectedItem.value ?? ""}
            // selectedItemId={selectedItemId}
            searchBarPlaceholder={
                MINIMAL_MODE && selectedItemId
                    ? (captureItems.find(item => item.id === selectedItemId)?.description ?? "Your thought...")
                    : "Your thought..."
            }
            // navigationTitle="Capture"
            isShowingDetail={!MINIMAL_MODE}
        >
            <List.Section>
                {captureItems.map(field => {
                    const { value, error } = captureItemsState[field.id as keyof CaptureItemsState]
                    // const isEmpty = !value || value.trim() === ""

                    if (MINIMAL_MODE) {
                        return (
                            <List.Item
                                key={field.id}
                                id={field.id}
                                icon={field.icon ? { source: field.icon, tintColor: Color.SecondaryText } : undefined}
                                // title={isEmpty && selectedItemId !== field.id ? "" : field.label}
                                title={field.label}
                                // subtitle={
                                //     selectedItemId === field.id
                                //         ? captureItemTypes[field.type.id].name
                                //         : isEmpty
                                //           ? field.label
                                //           : ""
                                // }
                                actions={
                                    <ActionPanel>
                                        <ActionPanel.Section title="Submit">
                                            <Action
                                                title="Create"
                                                icon={Icon.PlusCircle}
                                                onAction={async () => {
                                                    console.log(captureItemsState.content.value)

                                                    await closeMainWindow()
                                                    const toast = await showToast({
                                                        style: Toast.Style.Animated,
                                                        title: "Uploading Thought"
                                                    })

                                                    await setTimeout(2000)
                                                    toast.style = Toast.Style.Success
                                                    toast.title = "Created Thought"
                                                }}
                                            />
                                            <Action
                                                title="Create & Validate"
                                                icon={Icon.CheckCircle}
                                                onAction={() => console.log(captureItemsState.content.value)}
                                            />

                                            <Action
                                                title="Create & Repeat"
                                                autoFocus
                                                icon={Icon.Replace}
                                                shortcut={{ modifiers: ["shift"], key: "enter" }}
                                                onAction={() => console.log(captureItemsState.content.value)}
                                            />
                                            <Action
                                                title="Create, Validate & Repeat"
                                                icon={Icon.BulletPoints}
                                                shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                                                onAction={() => console.log(captureItemsState.content.value)}
                                            />

                                            {/* test */}
                                            {/* <Action
                                                title="Set Undef"
                                                icon={Icon.CheckCircle}
                                                shortcut={{ modifiers: ["cmd"], key: "u" }}
                                                onAction={() => setSelectedItemId(undefined)}
                                            /> */}
                                            <Action
                                                title="Down"
                                                icon={Icon.ArrowDown}
                                                shortcut={{ modifiers: ["shift"], key: "arrowDown" }}
                                                onAction={() =>
                                                    setSelectedItemId(
                                                        captureItems[
                                                            (captureItems.findIndex(item => item.id === selectedItemId) + 1) %
                                                                captureItems.length
                                                        ].id
                                                    )
                                                }
                                            />
                                            <Action
                                                title="Up"
                                                icon={Icon.ArrowUp}
                                                shortcut={{ modifiers: ["shift"], key: "arrowUp" }}
                                                onAction={() =>
                                                    setSelectedItemId(
                                                        captureItems[
                                                            (captureItems.findIndex(item => item.id === selectedItemId) -
                                                                1 +
                                                                captureItems.length) %
                                                                captureItems.length
                                                        ].id
                                                    )
                                                }
                                            />
                                        </ActionPanel.Section>
                                        {field.type.id === "enum" && (
                                            <ActionPanel.Section title="Select">
                                                <Action
                                                    title="Select Next"
                                                    icon={Icon.ArrowRight}
                                                    shortcut={{ modifiers: [], key: "arrowRight" }}
                                                    onAction={() => selectEnumValue({ forItem: field, inDirection: "next" })}
                                                />
                                                <Action
                                                    title="Select Previous"
                                                    icon={Icon.ArrowLeft}
                                                    shortcut={{ modifiers: [], key: "arrowLeft" }}
                                                    onAction={() =>
                                                        selectEnumValue({ forItem: field, inDirection: "previous" })
                                                    }
                                                />
                                            </ActionPanel.Section>
                                        )}
                                        {(field.type.id === "range" || field.type.id === "number") && (
                                            <ActionPanel.Section title="Select">
                                                <Action
                                                    title="Increase"
                                                    icon={Icon.ArrowUp}
                                                    shortcut={{ modifiers: [], key: "arrowRight" }}
                                                    onAction={() =>
                                                        adjustNumberValue({ forItem: field, inDirection: "increase" })
                                                    }
                                                />
                                                <Action
                                                    title="Decrease"
                                                    icon={Icon.ArrowDown}
                                                    shortcut={{ modifiers: [], key: "arrowLeft" }}
                                                    onAction={() =>
                                                        adjustNumberValue({ forItem: field, inDirection: "decrease" })
                                                    }
                                                />
                                            </ActionPanel.Section>
                                        )}
                                        <ActionPanel.Section title="Modify">
                                            <Action
                                                title="Clear All"
                                                icon={Icon.Trash}
                                                onAction={() => setCaptureItemsState(initialCaptureItemsState)}
                                            />
                                        </ActionPanel.Section>
                                    </ActionPanel>
                                }
                                accessories={getAccessories({ field, value, error })}
                            />
                        )
                    }

                    return (
                        <List.Item
                            key={field.id}
                            id={field.id}
                            title={selectedItemId === field.id ? field.label : ""}
                            subtitle={selectedItemId === field.id ? field.description : field.label}
                            detail={
                                <List.Item.Detail
                                    metadata={
                                        <List.Item.Detail.Metadata>
                                            <List.Item.Detail.Metadata.Label
                                                title="Content"
                                                text={captureItemsState.content.value}
                                            />
                                            <List.Item.Detail.Metadata.Separator />
                                            <List.Item.Detail.Metadata.Label
                                                title="Alias"
                                                text={captureItemsState.alias.value}
                                            />
                                            <List.Item.Detail.Metadata.Separator />
                                            <List.Item.Detail.Metadata.Label
                                                title="Priority"
                                                text={captureItemsState.priority.value}
                                            />
                                            <List.Item.Detail.Metadata.Separator />
                                            <List.Item.Detail.Metadata.Label title="Tags" text={captureItemsState.tags.value} />
                                        </List.Item.Detail.Metadata>
                                    }
                                />
                            }
                        />
                    )
                })}
            </List.Section>
            {/* <List.Section title="Actions" subtitle="The Actions of Your Thought">
                <List.Item title="Create" icon={Icon.PlusCircle} />
                <List.Item title="Create & Validate" icon={Icon.CheckCircle} />
                <List.Item
                    title="Create & Repeat"
                    icon={Icon.Replace}
                    accessories={[{ text: { value: "Create & Repeat", color: Color.SecondaryText }, icon: Icon.ArrowRight }]}
                />
                <List.Item
                    title="Create, Validate & Repeat"
                    icon={Icon.BulletPoints}
                    accessories={[{ text: { value: "Create, Validate & Repeat", color: Color.SecondaryText } }]}
                />
            </List.Section> */}
        </List>
    )
}
