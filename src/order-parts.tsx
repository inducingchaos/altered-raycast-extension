import { List } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState, useMemo } from "react"

interface Category {
    type: string
    id: string
    attributes: {
        _id: string
        name:
            | Array<{
                  value: string
                  languageCode: string
              }>
            | string
        fimId?: string
        aimsId?: string
        parentId?: string
        parentAimsId?: string
    }
}

interface CategoriesResponse {
    data: Category[]
    meta: {
        page: {
            total: number
            limit: number
            offset: number
            sort: {
                modifiedAt: number
            }
        }
    }
}

export default function OrderParts() {
    const [searchText, setSearchText] = useState("")
    const { isLoading, data } = useFetch<CategoriesResponse>(
        "https://b2b.atlastrailer.com/api/categories?" + new URLSearchParams({ q: "" }).toString(),
        {
            keepPreviousData: true
        }
    )

    const sections = useMemo(() => {
        if (!data?.data) return []

        console.log("Raw data:", data.data.length, "categories")

        // Create a map of all categories by ID for easy lookup
        const categoryMap = new Map(data.data.map(cat => [cat.id, cat]))

        // Create a set of all parent IDs that are referenced
        const referencedParentIds = new Set(
            data.data.map(cat => cat.attributes.parentId || cat.attributes.parentAimsId).filter((id): id is string => !!id)
        )

        // Find true parent categories (ones that are referenced but aren't children)
        const parentCategories = new Map<string, Category>()
        const childCategories = new Map<string, Category[]>()

        data.data.forEach(category => {
            const parentId = category.attributes.parentId || category.attributes.parentAimsId
            if (parentId) {
                // This is a child category
                if (!childCategories.has(parentId)) {
                    childCategories.set(parentId, [])
                }
                childCategories.get(parentId)?.push(category)
            }
        })

        // Add categories that are referenced as parents but aren't children
        referencedParentIds.forEach(parentId => {
            const category = categoryMap.get(parentId)
            if (category) {
                parentCategories.set(parentId, category)
            }
        })

        console.log("Parent categories:", parentCategories.size)
        console.log("Child categories:", childCategories.size)

        // Log a sample of the data structure
        if (parentCategories.size > 0) {
            const sampleParent = Array.from(parentCategories.values())[0]
            console.log("Sample parent:", {
                id: sampleParent.id,
                name: sampleParent.attributes.name,
                children: childCategories.get(sampleParent.id)?.length
            })
        }

        // Create sections
        const sections = Array.from(parentCategories.values()).map(parent => ({
            title:
                typeof parent.attributes.name === "string"
                    ? parent.attributes.name
                    : parent.attributes.name.find(n => n.languageCode === "en")?.value || "",
            items: childCategories.get(parent.id) || []
        }))

        console.log("Created sections:", sections.length)
        return sections
    }, [data])

    return (
        <List isLoading={isLoading} searchText={searchText} onSearchTextChange={setSearchText} filtering={true}>
            {sections.map(section => (
                <List.Section key={section.title} title={section.title}>
                    {section.items.map(category => (
                        <List.Item
                            key={category.id}
                            title={
                                typeof category.attributes.name === "string"
                                    ? category.attributes.name
                                    : category.attributes.name.find(
                                          (n: { value: string; languageCode: string }) => n.languageCode === "en"
                                      )?.value || ""
                            }
                            subtitle={category.attributes.aimsId}
                        />
                    ))}
                </List.Section>
            ))}
        </List>
    )
}
