/**
 *
 */

export function navigateArray<Item>({
    source,
    current: predicate,
    direction
}: {
    source: Item[]
    current: (item: Item) => boolean
    direction: "next" | "previous"
}): Item {
    const currentIndex = source.findIndex(predicate)
    const notFound = currentIndex === -1
    const offset = direction === "next" ? 1 : notFound ? 0 : -1 + source.length
    const offsetIndex = (currentIndex + offset) % source.length

    return source[offsetIndex]
}
