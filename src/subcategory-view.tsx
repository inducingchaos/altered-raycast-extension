import { List, ActionPanel, Action } from "@raycast/api"
import { useState, useMemo } from "react"
import ProductGrid from "./product-grid"

interface Category {
    type: string
    id: string
    attributes: {
        name: string | { value: string; languageCode: string }[]
        parentId: string
    }
}

interface SubCategoryViewProps {
    categoryId: string
    categoryName: string
    categories: Category[]
}

export default function SubCategoryView({ categoryId, categoryName, categories }: SubCategoryViewProps) {
    const [searchText, setSearchText] = useState("")

    const items = useMemo(() => {
        const subcategories = categories.filter(cat => cat.attributes.parentId === categoryId)
        console.log("SubCategoryView - Found", subcategories.length, "subcategories for", categoryName)
        return subcategories.map(category => ({
            id: category.id,
            title:
                typeof category.attributes.name === "string"
                    ? category.attributes.name
                    : category.attributes.name.find(n => n.languageCode === "en")?.value || ""
        }))
    }, [categories, categoryId, categoryName])

    return (
        <List searchText={searchText} onSearchTextChange={setSearchText} filtering={true} navigationTitle={categoryName}>
            {items.map(item => (
                <List.Item
                    key={item.id}
                    title={item.title}
                    actions={
                        <ActionPanel>
                            <Action.Push
                                title="View Products"
                                target={<ProductGrid categoryId={item.id} categoryName={item.title} />}
                            />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    )
}
