import { Thought } from "../types/thought"
import { DateTime } from "luxon"

export const getThoughtAlias = (thought: Thought): string => {
    const alias = thought["alias"]
    return typeof alias === "string" && alias.trim() !== "" ? alias : `Thought ${thought.id}`
}

export const isThoughtValidated = (thought: Thought): boolean => {
    // Check for attachmentId first (backwards compatibility)
    if (thought.attachmentId) return true

    // Then check for the validated property
    const validated = thought["validated"]
    if (typeof validated === "string") {
        return validated.toLowerCase() === "true"
    } else if (typeof validated === "boolean") {
        return validated
    }
    return false
}

export const formatSubtitle = (thought: Thought): string => {
    // Extract the first line or first 50 characters of content
    const contentPreview = thought.content.split("\n")[0].substring(0, 50) + (thought.content.length > 50 ? "..." : "")
    return contentPreview
}

export const formatDate = (date: Date): string => {
    return DateTime.fromJSDate(date).toLocaleString({ month: "long", day: "numeric" })
}

export const formatDetailDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}
