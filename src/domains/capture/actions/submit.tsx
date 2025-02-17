/**
 * @todo Extract actions out to SDKit.
 */

import { Action, ActionPanel, closeMainWindow, Icon, showToast, Toast } from "@raycast/api"
import { Dispatch, SetStateAction } from "react"
import { setTimeout } from "timers/promises"
import { DataStore } from "../types"
import { SafeDataColumn } from "../../shared/data/definitions"
import { validateStore } from "../../shared/data/utils/rules/validate/store"
import { useCapture } from "../components/context"
import { THIN_PIPE } from "~/domains/shared/utils"

export function SubmitActions(): JSX.Element {
    const { columns, dataStore, setDataStore } = useCapture()

    return (
        <ActionPanel.Section title="Submit">
            <Action
                title="Create"
                icon={Icon.PlusCircle}
                onAction={() => onCreateAction({ columns, dataStore, setDataStore })}
            />
            <Action title="Create & Validate" icon={Icon.CheckCircle} onAction={() => console.log("Create & Validate")} />

            <Action
                title="Create & Repeat"
                autoFocus
                icon={Icon.Replace}
                shortcut={{ modifiers: ["shift"], key: "enter" }}
                onAction={() => console.log("Create & Repeat")}
            />
            <Action
                title="Create, Validate & Repeat"
                icon={Icon.BulletPoints}
                shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                onAction={() => console.log("Create, Validate & Repeat")}
            />
        </ActionPanel.Section>
    )
}

export async function onCreateAction({
    columns,
    dataStore,
    setDataStore
}: {
    columns: SafeDataColumn[]
    dataStore: DataStore
    setDataStore: Dispatch<SetStateAction<DataStore>>
}): Promise<void> {
    const { success, errors } = validateStore({ columns, dataStore, setDataStore })

    if (!success) {
        await showToast({
            style: Toast.Style.Failure,
            title: `${columns.find(column => column.id === errors[0].metadata.columnId)?.name}${THIN_PIPE}${errors[0].title}`,
            message: errors[0].message

            // title: "Error Uploading Thought",
            // message: "Please complete the form."
        })

        return
    }

    console.log("Create")

    const data = Object.fromEntries(columns.map(column => [column.id, dataStore.get(column.id)?.value]))

    console.log(data)

    await closeMainWindow()
    const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Uploading Thought"
    })
    await setTimeout(2000)

    toast.style = Toast.Style.Success
    toast.title = "Created Thought"
}
