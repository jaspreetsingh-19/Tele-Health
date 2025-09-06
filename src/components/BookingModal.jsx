"use client"

import { useState } from "react"
import { X, Calendar, Clock, Video, MessageCircle, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import Script from "next/script"
import { toast } from "sonner"

<Script
    src="https://checkout.razorpay.com/v1/checkout.js"
    strategy="afterInteractive"
/>

export default function BookingModal({ doctor, selectedDate, selectedSlot, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        consultationType: "video",
        symptoms: "",
        patientNotes: "",
    })
    const [loading, setLoading] = useState(false)

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.symptoms.trim()) {
            toast.error("Please describe your symptoms")
            return
        }

        try {
            setLoading(true)
            console.log("Starting booking process")
            toast.loading("Preparing your appointment...")

            // STEP 1: Create payment order FIRST (without creating appointment)
            const paymentResponse = await axios.post("/api/payments/create-order", {
                doctorId: doctor._id,
                appointmentDate: selectedDate,
                timeSlot: selectedSlot,
                consultationType: formData.consultationType,
                symptoms: formData.symptoms,
                patientNotes: formData.patientNotes,
                // Don't create appointment yet, just prepare payment
            })

            if (paymentResponse.data.success) {
                toast.success("Payment order created successfully")

                // Load Razorpay script
                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    toast.error('Razorpay SDK failed to load. Please check your internet connection.');
                    setLoading(false);
                    return;
                }

                toast.info("Opening payment gateway...")

                // STEP 2: Initialize Razorpay payment
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: paymentResponse.data.order.amount,
                    currency: paymentResponse.data.order.currency,
                    name: "TeleHealth App",
                    description: `Consultation with Dr. ${doctor.doctorProfile.fullName}`,
                    order_id: paymentResponse.data.order.id,
                    handler: async (response) => {
                        try {
                            toast.loading("Verifying payment and booking appointment...")

                            // STEP 3: Verify payment AND create appointment in one call
                            const verifyResponse = await axios.post("/api/payments/verify-and-book", {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                // Include all appointment data
                                doctorId: doctor._id,
                                appointmentDate: selectedDate,
                                timeSlot: selectedSlot,
                                consultationType: formData.consultationType,
                                symptoms: formData.symptoms,
                                patientNotes: formData.patientNotes,
                            })

                            if (verifyResponse.data.success) {
                                toast.success("Payment successful! Your appointment has been confirmed.")
                                onSuccess()
                            }
                        } catch (error) {
                            console.error("Payment verification failed:", error)
                            toast.error("Payment verification failed. Please contact support.")
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            // Payment was cancelled/dismissed - no appointment created
                            console.log("Payment cancelled by user")
                            toast.info("Payment cancelled")
                            setLoading(false)
                        }
                    },
                    prefill: {
                        name: "Patient Name",
                        email: "patient@example.com",
                    },
                    theme: {
                        color: "#15803d",
                    },
                }

                const rzp = new window.Razorpay(options)
                rzp.on('payment.failed', (response) => {
                    // Payment failed - no appointment created
                    console.log("Payment failed:", response.error)
                    setLoading(false)
                    toast.error(response.error.description || "Payment processing failed")
                })

                rzp.open()
            }
        } catch (error) {
            console.error("Booking error:", error)
            setLoading(false)
            toast.error(error.response?.data?.message || "Failed to initiate booking process")
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 md:p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between pb-4 md:pb-6 px-4 md:px-6 pt-4 md:pt-6">
                    <CardTitle className="text-lg md:text-xl">Book Appointment</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        {/* Appointment Details */}
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="font-medium text-sm md:text-base">Appointment Details</h3>
                            <div className="grid grid-cols-1 gap-2 md:gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="text-xs md:text-sm break-words">{formatDate(selectedDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="text-xs md:text-sm">
                                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Info */}
                        <div className="space-y-2 md:space-y-3">
                            <h3 className="font-medium text-sm md:text-base">Doctor</h3>
                            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm md:text-base truncate">
                                        {doctor.doctorProfile.fullName}
                                    </p>
                                    <p className="text-xs md:text-sm text-muted-foreground break-words">
                                        {doctor.doctorProfile.specialization?.join(", ")}
                                    </p>
                                </div>
                                <Badge className="bg-primary text-primary-foreground flex-shrink-0 text-xs md:text-sm">
                                    ₹{doctor.doctorProfile.consultationFee}
                                </Badge>
                            </div>
                        </div>

                        {/* Consultation Type */}
                        <div className="space-y-2 md:space-y-3">
                            <Label className="text-sm md:text-base">Consultation Type</Label>
                            <RadioGroup
                                value={formData.consultationType}
                                onValueChange={(value) => setFormData({ ...formData, consultationType: value })}
                                className="space-y-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="video" id="video" />
                                    <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                                        <Video className="h-4 w-4 text-primary" />
                                        Video Call
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="chat" id="chat" />
                                    <Label htmlFor="chat" className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                                        <MessageCircle className="h-4 w-4 text-primary" />
                                        Chat
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Symptoms */}
                        <div className="space-y-2">
                            <Label htmlFor="symptoms" className="text-sm md:text-base">
                                Describe your symptoms *
                            </Label>
                            <Textarea
                                id="symptoms"
                                placeholder="Please describe your symptoms, concerns, or reason for consultation..."
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                rows={4}
                                required
                                className="text-sm md:text-base resize-none"
                            />
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm md:text-base">
                                Additional Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Any additional information you'd like to share with the doctor..."
                                value={formData.patientNotes}
                                onChange={(e) => setFormData({ ...formData, patientNotes: e.target.value })}
                                rows={3}
                                className="text-sm md:text-base resize-none"
                            />
                        </div>

                        {/* Payment Info */}
                        <div className="p-3 md:p-4 bg-accent/10 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="font-medium text-sm md:text-base">Payment Information</span>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                You will be redirected to secure payment gateway to complete the payment of ₹
                                {doctor.doctorProfile.consultationFee}. Your appointment will only be confirmed after successful payment.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 bg-transparent order-2 sm:order-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-primary hover:bg-primary/90 order-1 sm:order-2"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span className="text-sm md:text-base">Processing...</span>
                                    </div>
                                ) : (
                                    <span className="text-sm md:text-base">Book & Pay</span>
                                )}
                            </Button>
                        </div>

                        {/* Mobile-specific note */}
                        <div className="sm:hidden">
                            <p className="text-xs text-center text-muted-foreground">
                                Ensure you have a stable internet connection for payment processing
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}