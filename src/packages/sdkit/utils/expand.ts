/**
 *
 */

/**
 * Expands branded types for better readability. Preserves built-in types.
 */
export type Expand<Type, Except = never> = Type extends Except
    ? Type
    : Type extends Array<infer Item>
      ? Array<Expand<Item, Except>>
      : Type extends (...args: never[]) => unknown
        ? Type
        : Type extends Date
          ? Date
          : Type extends RegExp
            ? RegExp
            : Type extends Map<infer Key, infer Value>
              ? Map<Expand<Key, Except>, Expand<Value, Except>>
              : Type extends Set<infer Item>
                ? Set<Expand<Item, Except>>
                : Type extends object
                  ? {
                        [Key in keyof Type as Key extends string ? (string extends Key ? never : Key) : Key]: Expand<
                            Type[Key],
                            Except
                        >
                    }
                  : Type
