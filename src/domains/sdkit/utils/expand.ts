/**
 *
 */

export type Expand<Type> = Type extends object
    ? Type extends (...args: unknown[]) => unknown
        ? Type
        : { [Key in keyof Type as Key extends string ? (string extends Key ? never : Key) : Key]: Expand<Type[Key]> }
    : Type
