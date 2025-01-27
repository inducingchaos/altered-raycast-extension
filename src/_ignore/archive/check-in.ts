/**
 *
 */

import { AI, showHUD } from "@raycast/api"

export default async function CheckIn() {
    const answer = await AI.ask(
        `This response is for a Raycast command called 'Check In'. Provide a 2-8 word motivational message for the user, like "Get after it.", "Keep that momentum!" or "Do the things that others won't."`,
        {
            creativity: "maximum"
        }
    )

    await showHUD(answer)
}
