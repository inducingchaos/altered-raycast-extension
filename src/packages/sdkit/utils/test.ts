/**
 *
 */

export function test<Props, ForwardedProps, Result>({
    fn,
    props,
    expect: expected,
    options: { label, verbose, showProps, onError }
}: {
    fn: (props: Props) => Result
    props: Props
    expect: Result
    options: {
        label: string
        verbose?: boolean
        showProps?: boolean
        onError?: {
            throw?: boolean
            forwardProps?: ForwardedProps
        }
    }
}): Result {
    let result = fn(props)

    const success = result === expected
    if (success && verbose) console.log(`✅ Test Passed: ${label}`, { expected, result, props: showProps ? props : undefined })

    if (!success) {
        result = onError?.forwardProps ? fn({ ...props, ...onError.forwardProps }) : result

        const debugDetails = [`❌ Test Failed: ${label}`, { expected, result, props: showProps ? props : undefined }]

        if (onError?.throw) throw new Error(debugDetails[0] as string, { cause: debugDetails[1] })
        if (verbose) console.error(...debugDetails)
    }

    return result
}
