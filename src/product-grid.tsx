import { Grid, ActionPanel, Action } from "@raycast/api"
import { useFetch } from "@raycast/utils"
import { useState } from "react"
import ProductDetail from "./product-detail"

interface Product {
    type: string
    id: string
    attributes: {
        title: { value: string; languageCode: string }[]
        shortDescription: { value: string; languageCode: string }[]
        longDescription: { value: string; languageCode: string }[]
        manufacturerName: string
        distributorPartNumber: string
        manufacturerPartNumber: string
        images: {
            name: string
            sources: {
                url: string
                width: number
            }[]
        }[]
        inventory: {
            warehouseCode: string
            quantity: number
        }[]
        dealerPrice: number
        retailPrice: number
        clearancePrice: number
        flyerPrice: number
        FXSurcharge: number
        unitOfMeasure: string
        cataloguePageNum: string
        isDiscontinued: boolean
    }
}

interface ProductsResponse {
    data: Product[]
    meta: {
        total: number
        limit: number
        offset: number
        sort: string[]
    }
}

interface ProductGridProps {
    categoryId: string
    categoryName: string
}

export default function ProductGrid({ categoryId, categoryName }: ProductGridProps) {
    const [searchText, setSearchText] = useState("")
    const { isLoading, data } = useFetch<ProductsResponse>(
        "https://b2b.atlastrailer.com/api/clearance-product-search?" +
            new URLSearchParams({
                q: "",
                categoryId: categoryId,
                offset: "0",
                size: "25"
            }).toString(),
        {
            headers: {
                // spell-checker: disable
                cookie: "_ga=GA1.1.153569863.1743100735; x-session-id=a83f59fc-86df-4a0a-9476-be7a7ab73569; _ga_VV7YBBZ886=GS1.1.1743100735.1.1.1743101312.0.0.0"
            },
            keepPreviousData: true
        }
    )

    console.log("ProductGrid - Raw response:", JSON.stringify(data, null, 2))

    return (
        <Grid
            isLoading={isLoading}
            columns={3}
            fit={Grid.Fit.Contain}
            inset={Grid.Inset.Zero}
            aspectRatio="1"
            searchText={searchText}
            onSearchTextChange={setSearchText}
            navigationTitle={categoryName}
        >
            {data?.data.map(product => {
                const title = product.attributes.title.find(t => t.languageCode === "en")?.value || ""
                const description = product.attributes.shortDescription.find(d => d.languageCode === "en")?.value || ""
                const imageUrl = product.attributes.images[0]?.sources.find(s => s.width === 512)?.url || ""
                const totalStock = product.attributes.inventory.reduce((sum, inv) => sum + inv.quantity, 0)

                console.log("ProductGrid - Processing product:", {
                    id: product.id,
                    title,
                    description,
                    imageUrl,
                    totalStock
                })

                return (
                    <Grid.Item
                        key={product.id}
                        content={imageUrl}
                        title={title}
                        subtitle={`${product.attributes.manufacturerName} - ${product.attributes.distributorPartNumber} (${totalStock} in stock)`}
                        actions={
                            <ActionPanel>
                                <Action.Push title="View Details" target={<ProductDetail product={product} />} />
                            </ActionPanel>
                        }
                    />
                )
            })}
        </Grid>
    )
}
