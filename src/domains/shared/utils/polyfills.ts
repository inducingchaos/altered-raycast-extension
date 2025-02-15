/**
 *
 */

import { FormData, Headers, Request, Response, fetch } from "undici"

const polyfills = {
    FormData,
    Headers,
    Request,
    Response,
    fetch
}

Object.assign(globalThis, polyfills)
Object.keys(polyfills).forEach(polyfill => {
    if (!(polyfill in globalThis)) throw new Error(`Runtime API '${polyfill}' failed to load.`)
})

/**
 * Dummy value to make this a proper module.
 */
export const _ = "polyfills"
