import { Detail, ActionPanel, Action } from "@raycast/api"

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

interface ProductDetailProps {
    product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
    const title = product.attributes.title.find(t => t.languageCode === "en")?.value || ""
    const longDesc = product.attributes.longDescription.find(d => d.languageCode === "en")?.value || ""
    const totalStock = product.attributes.inventory.reduce((sum, inv) => sum + inv.quantity, 0)

    const markdown = `
# ${title}

## Description
${longDesc}
`

    return (
        <Detail
            markdown={markdown}
            navigationTitle={title}
            metadata={
                <Detail.Metadata>
                    <Detail.Metadata.Label title="Manufacturer" text={product.attributes.manufacturerName} />
                    <Detail.Metadata.Separator />
                    <Detail.Metadata.Label title="Part Numbers" />
                    <Detail.Metadata.Label title="Distributor" text={product.attributes.distributorPartNumber} />
                    <Detail.Metadata.Label title="Manufacturer" text={product.attributes.manufacturerPartNumber} />
                    <Detail.Metadata.Separator />
                    <Detail.Metadata.Label title="Unit" text={product.attributes.unitOfMeasure} />
                    <Detail.Metadata.Label title="Catalogue Page" text={product.attributes.cataloguePageNum} />
                    <Detail.Metadata.Label
                        title="Status"
                        text={product.attributes.isDiscontinued ? "Discontinued" : "Active"}
                    />
                    <Detail.Metadata.Separator />
                    <Detail.Metadata.Label title="Pricing" />
                    <Detail.Metadata.Label title="Dealer Price" text={`$${product.attributes.dealerPrice.toFixed(2)}`} />
                    <Detail.Metadata.Label title="Retail Price" text={`$${product.attributes.retailPrice.toFixed(2)}`} />
                    {product.attributes.clearancePrice > 0 && (
                        <Detail.Metadata.Label
                            title="Clearance Price"
                            text={`$${product.attributes.clearancePrice.toFixed(2)}`}
                        />
                    )}
                    {product.attributes.flyerPrice > 0 && (
                        <Detail.Metadata.Label title="Flyer Price" text={`$${product.attributes.flyerPrice.toFixed(2)}`} />
                    )}
                    {product.attributes.FXSurcharge > 0 && (
                        <Detail.Metadata.Label title="FX Surcharge" text={`$${product.attributes.FXSurcharge.toFixed(2)}`} />
                    )}
                    <Detail.Metadata.Separator />
                    <Detail.Metadata.Label title="Inventory" text={"---"} />
                    {product.attributes.inventory.map(inv => (
                        <Detail.Metadata.Label
                            key={inv.warehouseCode}
                            title={`Warehouse ${inv.warehouseCode}`}
                            text={`${inv.quantity} units`}
                        />
                    ))}
                    <Detail.Metadata.Label title="Total Stock" text={`${totalStock} units`} />
                </Detail.Metadata>
            }
            actions={
                <ActionPanel>
                    <Action.CopyToClipboard title="Copy Part Number" content={product.attributes.distributorPartNumber} />
                    <Action.CopyToClipboard
                        title="Copy Manufacturer Part Number"
                        content={product.attributes.manufacturerPartNumber}
                    />
                </ActionPanel>
            }
        />
    )
}
