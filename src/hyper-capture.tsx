/**
 *
 */

import { HyperForm } from "@sdkit/domains/raycast/components"

export default function HyperCapture() {
    return (
        <HyperForm
            config={{
                schemas: [
                    {
                        id: "thoughts",
                        name: "Thoughts",
                        description: "A collection of the thoughts in your ALTERED brain.",

                        fields: [
                            {
                                id: "thoughts",
                                name: "Thoughts",
                                description: "A collection of the thoughts in your ALTERED brain.",
                                type: "string",
                                required: true,
                                constraints: [
                                    {
                                        id: "max-length",
                                        parameters: {
                                            value: 255
                                        }
                                    }
                                ]
                            },
                            {
                                id: "alias",
                                name: "Alias",
                                description: "A name for your thought.",
                                type: "string",
                                required: false,
                                constraints: []
                            }
                        ]
                    }
                ]
            }}
        />
    )
}
