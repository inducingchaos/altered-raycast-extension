import { List } from "@raycast/api"
import { useHyperForm } from "../context"
import { HyperFormField } from "../definitions"

export function HyperFormList(): JSX.Element {
    const { schemas } = useHyperForm()
    return (
        <List>
            {schemas.length > 0 ? (
                schemas.map(schema => (
                    <List.Section key={schema.id} title={schema.name}>
                        {schema.fields.map(field => (
                            <HyperFormListItem key={field.id} field={field} />
                        ))}
                    </List.Section>
                ))
            ) : (
                <List.EmptyView title="No schemas found" />
            )}
        </List>
    )
}

export function HyperFormListItem({ field }: { field: HyperFormField }): JSX.Element {
    return <List.Item title={field.name} />
}
