/**
 *
 */

import "~/domains/shared/utils/polyfills"
import { CaptureForm } from "./domains/capture/components/layout"
import { test } from "~/domains/shared/utils/test"

export default function Capture() {
    test()
    return <CaptureForm />
}
