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
            // toast({
            //     title: "Error",
            //     description: "Please describe your symptoms",
            //     variant: "destructive",
            // })
            return
        }

        try {
            setLoading(true)
            console.log("Starting booking process")

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
                // Load Razorpay script
                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    alert('Razorpay SDK failed to load. Please check your internet connection.');
                    setLoading(false);
                    return;
                }

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
                                // toast({
                                //     title: "Payment Successful",
                                //     description: "Your appointment has been confirmed!",
                                // })
                                onSuccess()
                            }
                        } catch (error) {
                            console.error("Payment verification failed:", error)
                            // toast({
                            //     title: "Payment Verification Failed",
                            //     description: "Please contact support",
                            //     variant: "destructive",
                            // })
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            // Payment was cancelled/dismissed - no appointment created
                            console.log("Payment cancelled by user")
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
                    // toast({
                    //     title: "Payment Failed",
                    //     description: response.error.description || "Payment processing failed",
                    //     variant: "destructive",
                    // })
                })

                rzp.open()
            }
        } catch (error) {
            console.error("Booking error:", error)
            setLoading(false)
            // toast({
            //     title: "Error",
            //     description: error.response?.data?.message || "Failed to initiate booking process",
            //     variant: "destructive",
            // })
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Book Appointment</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Appointment Details */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Appointment Details</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="text-sm">{formatDate(selectedDate)}</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="text-sm">
                                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Info */}
                        <div className="space-y-2">
                            <h3 className="font-medium">Doctor</h3>
                            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                <div>
                                    <p className="font-medium">{doctor.doctorProfile.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{doctor.doctorProfile.specialization?.join(", ")}</p>
                                </div>
                                <Badge className="bg-primary text-primary-foreground">₹{doctor.doctorProfile.consultationFee}</Badge>
                            </div>
                        </div>

                        {/* Consultation Type */}
                        <div className="space-y-3">
                            <Label>Consultation Type</Label>
                            <RadioGroup
                                value={formData.consultationType}
                                onValueChange={(value) => setFormData({ ...formData, consultationType: value })}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="video" id="video" />
                                    <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                                        <Video className="h-4 w-4 text-primary" />
                                        Video Call
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="chat" id="chat" />
                                    <Label htmlFor="chat" className="flex items-center gap-2 cursor-pointer">
                                        <MessageCircle className="h-4 w-4 text-primary" />
                                        Chat
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Symptoms */}
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">Describe your symptoms *</Label>
                            <Textarea
                                id="symptoms"
                                placeholder="Please describe your symptoms, concerns, or reason for consultation..."
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                rows={4}
                                required
                            />
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any additional information you'd like to share with the doctor..."
                                value={formData.patientNotes}
                                onChange={(e) => setFormData({ ...formData, patientNotes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Payment Info */}
                        <div className="p-4 bg-accent/10 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                <span className="font-medium">Payment Information</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                You will be redirected to secure payment gateway to complete the payment of ₹
                                {doctor.doctorProfile.consultationFee}. Your appointment will only be confirmed after successful payment.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                                {loading ? "Processing..." : "Book & Pay"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}