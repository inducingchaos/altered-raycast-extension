/**
 *
 */

import { Detail } from "@raycast/api"
import { useFetch } from "@raycast/utils"

export default function Echo() {
    const { data, isLoading } = useFetch("https://altered.app/api/raycast/echo", {
        parseResponse: async response => await response.json()
    })

    return (
        <Detail
            isLoading={isLoading}
            markdown={!isLoading ? `${"```json"}\n${JSON.stringify(data, null, 4)}\n${"```"}` : null}
        />
    )
}
