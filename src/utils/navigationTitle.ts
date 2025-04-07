interface TitleStats {
    position?: number // Current thought position (1-based)
    selected?: number // Number of selected thoughts
    results?: number // Number of search results
    total: number // Total in current context
    datasetName?: string // Current dataset name if any
    filter?: "validated" | "pending" // System-level filter if any
}

const MAX_DATASET_LENGTH = 20

function truncateDataset(name: string): string {
    return name.length > MAX_DATASET_LENGTH ? `${name.slice(0, MAX_DATASET_LENGTH - 1)}…` : name
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
    return count === 1 ? singular : plural
}

function getThoughtType(filter?: "validated" | "pending"): string {
    if (!filter) return "Thought"
    return filter.charAt(0).toUpperCase() + filter.slice(1) + " Thought"
}

export function formatNavigationTitle(stats: TitleStats): string {
    const parts: string[] = []
    const thoughtType = getThoughtType(stats.filter)

    // Priority 1: Selection count
    if (stats.selected) {
        parts.push(`${stats.selected} Selected`)
        return `${parts.join(", ")}` // Early return, don't show position with selection
    }

    // Priority 2: Position (only show if no selection)
    if (stats.position !== undefined) {
        if (stats.results) {
            // Position within search results
            parts.push(`${thoughtType} ${stats.position} of ${stats.results} ${pluralize(stats.results, "Result")}`)
        } else if (stats.datasetName) {
            // Position within dataset
            parts.push(`${stats.position} of ${stats.total}`)
        } else {
            // Position within all thoughts
            parts.push(`${thoughtType} ${stats.position} of ${stats.total}`)
        }

        // Add dataset context if present
        if (stats.datasetName) {
            parts.push(`in '${truncateDataset(stats.datasetName)}'`)
        }

        return parts.join(" ")
    }

    // Priority 3: Search results (only if search text exists)
    if (stats.results !== undefined && stats.results !== stats.total) {
        if (stats.datasetName) {
            parts.push(`${stats.results} of ${stats.total} in '${truncateDataset(stats.datasetName)}'`)
        } else {
            const pluralType = stats.filter
                ? `${stats.filter.charAt(0).toUpperCase() + stats.filter.slice(1)} Thoughts`
                : "Thoughts"
            parts.push(`${stats.results} of ${stats.total} ${pluralType}`)
        }
        return parts.join(" ")
    }

    // Priority 4: Dataset context or total
    if (stats.datasetName) {
        parts.push(`${stats.total} in '${truncateDataset(stats.datasetName)}'`)
    } else {
        const pluralType = stats.filter
            ? `${stats.filter.charAt(0).toUpperCase() + stats.filter.slice(1)} Thoughts`
            : "Thoughts"
        parts.push(`${stats.total} ${pluralType}`)
    }

    return parts.join(" ")
}
