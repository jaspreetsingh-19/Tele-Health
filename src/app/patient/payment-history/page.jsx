"use client"

import { useState, useEffect } from "react"
import { CreditCard, Calendar, Download, Filter, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function PaymentHistoryPage() {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState({
        status: "all",
        startDate: "",
        endDate: "",
    })

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true)


            // Get all appointments for the patient
            const response = await fetch("/api/appointments?role=patient")
            const data = await response.json()

            if (data.success) {
                // Filter appointments with payment information
                const appointmentsWithPayments = data.appointments.filter(
                    (apt) => apt.paymentStatus && apt.paymentStatus !== "pending",
                )

                // Apply filters
                let filteredPayments = appointmentsWithPayments

                if (filter.status !== "all") {
                    filteredPayments = filteredPayments.filter((apt) => apt.paymentStatus === filter.status)
                }

                if (filter.startDate) {
                    filteredPayments = filteredPayments.filter(
                        (apt) => new Date(apt.appointmentDate) >= new Date(filter.startDate),
                    )
                }

                if (filter.endDate) {
                    filteredPayments = filteredPayments.filter((apt) => new Date(apt.appointmentDate) <= new Date(filter.endDate))
                }

                // Sort payments by appointment date (latest first)
                const sortedPayments = filteredPayments.sort((a, b) =>
                    new Date(b.appointmentDate) - new Date(a.appointmentDate)
                )

                setPayments(sortedPayments)
                toast.success(`Loaded ${sortedPayments.length} payment records`, { id: "fetch-payments" })
            }
        } catch (error) {
            toast.error("Failed to fetch payment history", {
                id: "fetch-payments",
                description: "Please try again or contact support"
            })
        } finally {
            setLoading(false)
        }
    }

    const downloadReceipt = async (appointmentId) => {
        try {


            const response = await fetch(`/api/appointments/${appointmentId}/receipt`)

            if (!response.ok) {
                throw new Error("Failed to fetch receipt")
            }

            const html = await response.text()
            const newWindow = window.open()
            newWindow.document.write(html)
            newWindow.document.close()

            toast.success("Payment receipt opened", {
                id: "download-receipt",
                description: "You can print the receipt from the new window"
            })
        } catch (error) {
            console.error(error)
            toast.error("Failed to open receipt", {
                id: "download-receipt",
                description: "Please try again"
            })
        }
    }


    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "paid":
                return "bg-accent text-accent-foreground"
            case "failed":
                return "bg-destructive text-destructive-foreground"
            case "refunded":
                return "bg-secondary text-secondary-foreground"
            default:
                return "bg-muted text-muted-foreground"
        }
    }

    const getTotalAmount = () => {
        return payments.reduce((total, payment) => {
            if (payment.paymentStatus === "paid") {
                return total + payment.consultationFee
            }
            return total
        }, 0)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const clearFilters = () => {
        setFilter({ status: "all", startDate: "", endDate: "" })
        toast.success("Filters cleared")
    }

    useEffect(() => {
        fetchPaymentHistory()
    }, [filter])

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Payment History</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">View and manage your payment transactions</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-xl sm:text-2xl font-bold text-primary">₹{getTotalAmount()}</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent rounded-full flex items-center justify-center">
                                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-accent-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-muted-foreground">Total Payments</p>
                                    <p className="font-bold text-sm sm:text-base">{payments.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                                    <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-muted-foreground">Successful</p>
                                    <p className="font-bold text-sm sm:text-base">{payments.filter((p) => p.paymentStatus === "paid").length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-destructive rounded-full flex items-center justify-center">
                                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-destructive-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-muted-foreground">Failed</p>
                                    <p className="font-bold text-sm sm:text-base">{payments.filter((p) => p.paymentStatus === "failed").length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center">
                                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-muted-foreground">Refunded</p>
                                    <p className="font-bold text-sm sm:text-base">{payments.filter((p) => p.paymentStatus === "refunded").length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label className="text-sm">Payment Status</Label>
                                <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Start Date</Label>
                                <Input
                                    type="date"
                                    value={filter.startDate}
                                    onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                    className="text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">End Date</Label>
                                <Input
                                    type="date"
                                    value={filter.endDate}
                                    onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                    className="text-sm"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="w-full text-sm"
                                    size="sm"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-sm sm:text-base text-muted-foreground">Loading payment history...</div>
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-8">
                                <CreditCard className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-base sm:text-lg font-medium">No payments found</h3>
                                <p className="text-sm sm:text-base text-muted-foreground">No payment transactions match your current filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {payments.map((payment) => (
                                    <div
                                        key={payment._id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm sm:text-base truncate">
                                                    Dr. {payment.doctorId?.doctorProfile?.fullName || payment.doctorId?.username}
                                                </p>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(payment.appointmentDate)}</span>
                                                    </div>
                                                    <Badge className={`${getPaymentStatusColor(payment.paymentStatus)} text-xs w-fit`}>
                                                        {payment.paymentStatus}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                            <div className="text-left sm:text-right">
                                                <p className="font-bold text-sm sm:text-base">₹{payment.consultationFee}</p>
                                                {payment.paymentId && (
                                                    <p className="text-xs text-muted-foreground">ID: {payment.paymentId.slice(-8)}</p>
                                                )}
                                            </div>
                                            {payment.paymentStatus === "paid" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => downloadReceipt(payment._id)}
                                                    className="bg-transparent flex-shrink-0"
                                                >
                                                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="ml-1 sm:hidden">Receipt</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}