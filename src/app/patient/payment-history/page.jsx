"use client"

import { useState, useEffect } from "react"
import { CreditCard, Calendar, Download, Filter, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import axios from "axios"

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
            const response = await axios.get("/api/appointments?role=patient")
            if (response.data.success) {
                // Filter appointments with payment information
                const appointmentsWithPayments = response.data.appointments.filter(
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

                setPayments(filteredPayments)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch payment history",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const downloadReceipt = async (appointmentId) => {
        try {
            // In a real implementation, this would generate and download a PDF receipt
            toast({
                title: "Receipt Downloaded",
                description: "Payment receipt has been downloaded",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to download receipt",
                variant: "destructive",
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

    useEffect(() => {
        fetchPaymentHistory()
    }, [filter])

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
                        <p className="text-muted-foreground">View and manage your payment transactions</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-2xl font-bold text-primary">₹{getTotalAmount()}</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                                    <CreditCard className="h-4 w-4 text-accent-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Payments</p>
                                    <p className="font-bold">{payments.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <Receipt className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Successful</p>
                                    <p className="font-bold">{payments.filter((p) => p.paymentStatus === "paid").length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                                    <CreditCard className="h-4 w-4 text-destructive-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                    <p className="font-bold">{payments.filter((p) => p.paymentStatus === "failed").length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                    <CreditCard className="h-4 w-4 text-secondary-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Refunded</p>
                                    <p className="font-bold">{payments.filter((p) => p.paymentStatus === "refunded").length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-primary" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Payment Status</Label>
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
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={filter.startDate}
                                    onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={filter.endDate}
                                    onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setFilter({ status: "all", startDate: "", endDate: "" })}
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-muted-foreground">Loading payment history...</div>
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-8">
                                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">No payments found</h3>
                                <p className="text-muted-foreground">No payment transactions match your current filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {payments.map((payment) => (
                                    <div
                                        key={payment._id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Dr. {payment.doctorId?.doctorProfile?.fullName || payment.doctorId?.username}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(payment.appointmentDate)}</span>
                                                    <Badge className={getPaymentStatusColor(payment.paymentStatus)}>
                                                        {payment.paymentStatus}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold">₹{payment.consultationFee}</p>
                                                {payment.paymentId && (
                                                    <p className="text-xs text-muted-foreground">ID: {payment.paymentId.slice(-8)}</p>
                                                )}
                                            </div>
                                            {payment.paymentStatus === "paid" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => downloadReceipt(payment._id)}
                                                    className="bg-transparent"
                                                >
                                                    <Download className="h-4 w-4" />
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
