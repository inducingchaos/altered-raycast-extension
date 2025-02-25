/**
 *
 */

/**
 * Type predicate that checks if a value is a valid number (including zero)
 * This helps TypeScript understand the type narrowing
 */
export function isValidNumber(value: unknown): value is number {
    return value !== undefined && value !== null && !isNaN(Number(value))
}

/**
 * Parses a string value into a number if possible
 */
export function parseNumberValue(value: unknown): number | undefined {
    if (!value && value !== 0) return undefined
    const number = Number(typeof value === "string" ? value.trim() : value)
    return !isNaN(number) ? number : undefined
}
