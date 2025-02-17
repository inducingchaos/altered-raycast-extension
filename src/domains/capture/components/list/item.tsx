/**
 *
 */

import { List } from "@raycast/api"
import { useMemo } from "react"
import { dataTypes, SafeDataColumn } from "../../../shared/data/definitions"
import { CaptureActions } from "../../actions"
import { createDataColumnListItemAccessories } from "../../utils"
import { useCapture } from "../context"

export function DataColumnListItem({ column }: { column: SafeDataColumn }): JSX.Element {
    const { dataStore, selectedItemId } = useCapture()

    const isSelected = selectedItemId === column.id

    const value = useMemo(() => dataStore.get(column.id)?.value, [isSelected])
    const isEmpty = value === undefined || value === ""

    const title = isSelected || !isEmpty ? column.name : ""
    const subtitle = isSelected
        ? Object.values(dataTypes).find(type => type.id === column.type)?.info.name
        : !isEmpty
          ? undefined
          : column.name

    return (
        <List.Item
            key={column.id}
            id={column.id}
            title={title}
            subtitle={subtitle}
            // subtitle={TEMP_createSubtitleAccessories({ constraints: column.constraints })}
            actions={<CaptureActions />}
            detail={
                <List.Item.Detail
                    key={column.id}
                    metadata={
                        <List.Item.Detail.Metadata>
                            <List.Item.Detail.Metadata.Label title="Types" />
                            <List.Item.Detail.Metadata.Label title="Grass" icon="pokemon_types/grass.svg" />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="Poison" icon="pokemon_types/poison.svg" />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="Characteristics" />
                            <List.Item.Detail.Metadata.Label title="Height" text="70cm" />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="Weight" text="6.9 kg" />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="Abilities" />
                            <List.Item.Detail.Metadata.Label title="Chlorophyll" text="Main Series" />
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="Overgrow" text="Main Series" />
                            <List.Item.Detail.Metadata.Separator />
                        </List.Item.Detail.Metadata>
                    }
                />
            }
            accessories={createDataColumnListItemAccessories({ column, state: dataStore.get(column.id), isSelected })}
        />
    )
}

// /**
//  * @remarks May not be necessary.
//  */
// export const MemoizedDataColumnListItem = memo(DataColumnListItem)
