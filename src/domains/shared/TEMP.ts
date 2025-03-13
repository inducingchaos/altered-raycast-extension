/**
 *
 */

export const debug = {
    enabled: true,
    flags: {
        onSearchTextChange: true,
        onSelectionChange: true
    },
    state: {
        onSearchTextChange: {
            count: 0
        },
        onSelectionChange: {
            count: 0
        }
    }
} satisfies {
    enabled: boolean
    flags?: Record<string, boolean>
    state?: Record<string, unknown>
}

export const shouldShowDebug = ({ for: flag }: { for: keyof (typeof debug)["flags"] }): boolean => {
    if (!debug.enabled) return false
    if (!debug.flags?.[flag]) return false

    return true
}

// spell-checker:disable-next-line
export const ME = "dFgkaKdK7T8b6HwJ8vycz"
