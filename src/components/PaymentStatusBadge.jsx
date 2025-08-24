import { Badge } from "@/components/ui/badge"

export default function PaymentStatusBadge({ status }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case "paid":
                return {
                    className: "bg-accent text-accent-foreground",
                    label: "Paid",
                }
            case "pending":
                return {
                    className: "bg-secondary text-secondary-foreground",
                    label: "Pending",
                }
            case "failed":
                return {
                    className: "bg-destructive text-destructive-foreground",
                    label: "Failed",
                }
            case "refunded":
                return {
                    className: "bg-muted text-muted-foreground",
                    label: "Refunded",
                }
            default:
                return {
                    className: "bg-secondary text-secondary-foreground",
                    label: "Unknown",
                }
        }
    }

    const config = getStatusConfig(status)

    return <Badge className={config.className}>{config.label}</Badge>
}
