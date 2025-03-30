import { Action, ActionPanel, Form, showToast, Toast, closeMainWindow } from "@raycast/api"
import { useNavigation } from "@raycast/api"

function SignatureView() {
    async function handleSubmit(values: { signature: string; terms: boolean; completionDate: Date }) {
        if (!values.signature) {
            showToast({
                style: Toast.Style.Failure,
                title: "Signature is required"
            })
            return
        }

        if (!values.terms) {
            showToast({
                style: Toast.Style.Failure,
                title: "You must accept the terms and conditions"
            })
            return
        }
        await closeMainWindow()

        const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Creating work order..."
        })

        await new Promise(resolve => setTimeout(resolve, 2000))

        toast.style = Toast.Style.Success
        toast.title = "Work order created"
        toast.message = "Thank you for your business!"
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Submit Work Order" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField id="signature" title="Signature" placeholder="Type your signature here..." />
            <Form.Checkbox
                id="terms"
                title="Terms and Conditions"
                label="I agree to the terms and conditions"
                defaultValue={false}
            />
            <Form.DatePicker id="completionDate" title="Requested Completion Date" />
        </Form>
    )
}

export default function Command() {
    const { push } = useNavigation()

    const handleFormSubmit = () => {
        push(<SignatureView />)
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Continue to Signature" onSubmit={handleFormSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField id="customerName" title="Customer Name" placeholder="Enter customer name" />
            <Form.TextField id="phoneNumber" title="Phone Number" placeholder="Enter phone number" />
            <Form.TextField id="email" title="Email" placeholder="Enter email address" />
            <Form.Dropdown id="preferredContactMethod" title="Preferred Contact Method">
                <Form.Dropdown.Item value="phone" title="Phone" />
                <Form.Dropdown.Item value="email" title="Email" />
                <Form.Dropdown.Item value="text" title="Text Message" />
            </Form.Dropdown>
            <Form.Separator />
            <Form.TextField id="trailerMake" title="Trailer Make" placeholder="Enter trailer make" />
            <Form.TextField id="trailerModel" title="Trailer Model" placeholder="Enter trailer model" />
            <Form.TextField id="trailerYear" title="Trailer Year" placeholder="Enter trailer year" />
            <Form.TextField id="vinNumber" title="VIN Number" placeholder="Enter VIN number" />
            <Form.Separator />
            <Form.TextArea id="issues" title="Issues Reported" placeholder="Describe the issues..." />
            <Form.TextArea id="additionalNotes" title="Additional Notes" placeholder="Any additional notes..." />
            <Form.DatePicker id="estimatedCompletionDate" title="Estimated Completion Date" />
        </Form>
    )
}
