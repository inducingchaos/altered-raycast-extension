/**
 *
 */

import { Action, ActionPanel, closeMainWindow, Icon, showToast, Toast } from "@raycast/api"
import { setTimeout } from "timers/promises"

export function SubmitActions(): JSX.Element {
    return (
        <ActionPanel.Section title="Submit">
            <Action
                title="Create"
                icon={Icon.PlusCircle}
                onAction={async () => {
                    console.log("Create")

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
