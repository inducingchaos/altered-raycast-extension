/**
 * Shared structure for displaying information across different UI contexts
 */
export type LayeredInfo = {
    // Configuration context (schema building)
    config: {
        name: string
        description: string
        icon?: string
    }
    // Implementation context (runtime usage)
    usage: {
        label: string
        description: string
        error?: {
            label: string
            description: string
        }
    }
}
