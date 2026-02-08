import { NextResponse } from "next/server"
import crypto from "crypto"
import connectDB from "@/lib/db"
import Appointment from "@/models/Appointment"
import { getDataFromToken } from "@/helper/getDataFromToken"

export async function POST(request) {
    try {
        await connectDB()
        const userId = await getDataFromToken(request)
        const body = await request.json()
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = body

        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex")

        if (razorpay_signature !== expectedSign) {
            return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 })
        }

        // Update appointment payment status
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment) {
            return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
        }

        appointment.paymentStatus = "paid"
        appointment.paymentId = razorpay_payment_id
        await appointment.save()

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully",
        })
    } catch (error) {
        console.error("Error verifying payment:", error)
        return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 500 })
    }
}
