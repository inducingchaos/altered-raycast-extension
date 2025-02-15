/**
 *
 */

import { List } from "@raycast/api"
import { useCapture } from "../context"
import { DataColumnListItem } from "./item"

export function DataColumnListSection(): JSX.Element {
    const { columns } = useCapture()

    return (
        <List.Section>
            {columns.map(column => (
                <DataColumnListItem key={column.id} column={column} />
            ))}
        </List.Section>
    )
}
