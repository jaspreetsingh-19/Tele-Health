import { NextResponse } from "next/server"
import Razorpay from "razorpay"
import connectDB from "@/lib/db"
import Appointment from "@/models/Appointment"
import { getDataFromToken } from "@/helper/getDataFromToken"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request) {
    try {
        await connectDB()
        const userId = await getDataFromToken(request)
        const body = await request.json()
        const { appointmentId, reason } = body

        // Get appointment details
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment) {
            return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
        }

        // Verify user owns this appointment or is the doctor
        if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 403 })
        }

        // Check if appointment is paid and can be refunded
        if (appointment.paymentStatus !== "paid") {
            return NextResponse.json({ success: false, message: "Appointment is not paid" }, { status: 400 })
        }

        if (!appointment.paymentId) {
            return NextResponse.json({ success: false, message: "No payment ID found" }, { status: 400 })
        }

        // Create refund
        const refund = await razorpay.payments.refund(appointment.paymentId, {
            amount: appointment.consultationFee * 100, // Amount in paise
            notes: {
                reason: reason || "Appointment cancelled",
                appointmentId: appointmentId,
            },
        })

        // Update appointment status
        appointment.paymentStatus = "refunded"
        appointment.status = "cancelled"
        await appointment.save()

        return NextResponse.json({
            success: true,
            message: "Refund initiated successfully",
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
            },
        })
    } catch (error) {
        console.error("Error processing refund:", error)
        return NextResponse.json({ success: false, message: "Failed to process refund" }, { status: 500 })
    }
}
