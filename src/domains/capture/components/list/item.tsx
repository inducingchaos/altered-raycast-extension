/**
 *
 */

import { Color, List } from "@raycast/api"
import { useMemo } from "react"
import { dataTypes, SafeDataColumn } from "../../../shared/data/definitions"
import { CaptureActions } from "../../actions"
import { createDataColumnListItemAccessories } from "../../utils"
import { useCapture } from "../context"
import { createDataColumnListItemRuleAccessories } from "../../utils/accessories/create/rules"

export function DataColumnListItem({ column }: { column: SafeDataColumn }): JSX.Element {
    const { dataStore, selectedItemId, state } = useCapture()

    const isSelected = selectedItemId === column.id

    const value = useMemo(() => dataStore.get(column.id)?.value, [isSelected])
    const isEmpty = value === undefined || value === ""

    const title = isSelected || !isEmpty ? column.name : ""
    const subtitle = isSelected
        ? Object.values(dataTypes).find(type => type.id === column.type)?.info.name
        : !isEmpty
          ? undefined
          : column.name

    const accessories = createDataColumnListItemAccessories({ column, state: dataStore.get(column.id), isSelected })

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
                    //                     markdown={`**${column.name}**

                    // ${state.content.value}`}
                    metadata={
                        <List.Item.Detail.Metadata>
                            <List.Item.Detail.Metadata.Label title="Name" text={column.name} />
                            <List.Item.Detail.Metadata.Label
                                title="Type"
                                text={{
                                    value: column.type,
                                    color: Color.SecondaryText
                                }}
                            />
                            <List.Item.Detail.Metadata.TagList title="Constraints">
                                {createDataColumnListItemRuleAccessories({ constraints: column.constraints ?? [] }).map(
                                    accessory => {
                                        const tag = accessory as List.Item.Accessory & { tag: { value: string; color: Color } }

                                        return (
                                            <List.Item.Detail.Metadata.TagList.Item
                                                key={tag.tag.value}
                                                text={tag.tag.value}
                                                color={tag.tag.color}
                                            />
                                        )
                                    }
                                )}
                            </List.Item.Detail.Metadata.TagList>
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="Characteristics" />
                            <List.Item.Detail.Metadata.Label title="Height" text={state.content.value} />
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
            accessories={accessories}
        />
    )
}

// /**
//  * @remarks May not be necessary.
//  */
// export const MemoizedDataColumnListItem = memo(DataColumnListItem)
