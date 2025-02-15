/**
 *
 */

import { HyperFormContextProvider } from "./context"
import { HyperFormProps } from "./definitions"
import { HyperFormList } from "./list"

export function HyperForm({ config }: HyperFormProps): JSX.Element {
    return (
        <HyperFormContextProvider config={config}>
            <HyperFormList />
        </HyperFormContextProvider>
    )
}
