/**
 *
 */

import { List } from "@raycast/api"
import { useCaptureList } from "../provider"
import { DataColumnListItem } from "./item"

export function DataColumnListSection(): JSX.Element {
    const { columns } = useCaptureList()

    return (
        <List.Section>
            {columns.map(column => (
                <DataColumnListItem key={column.id} column={column} />
            ))}
        </List.Section>
    )
}
