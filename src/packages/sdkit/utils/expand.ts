/**
 * Type utility that expands object types for better intellisense,
 * while preserving built-in types like Array, Function, Date etc.
 */

export type Expand<Type> =
    Type extends Array<infer Item>
        ? Array<Expand<Item>>
        : Type extends (...args: unknown[]) => unknown
          ? Type
          : Type extends Date
            ? Date
            : Type extends RegExp
              ? RegExp
              : Type extends Map<infer K, infer V>
                ? Map<Expand<K>, Expand<V>>
                : Type extends Set<infer Item>
                  ? Set<Expand<Item>>
                  : Type extends object
                    ? {
                          [Key in keyof Type as Key extends string ? (string extends Key ? never : Key) : Key]: Expand<
                              Type[Key]
                          >
                      }
                    : Type
