import { NextResponse } from "next/server"
import Razorpay from "razorpay"
import connectDB from "@/lib/db"
import User from "@/models/user" // Assuming you have a User model
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

        const {
            doctorId,
            appointmentDate,
            timeSlot,
            consultationType,
            symptoms,
            patientNotes
        } = body

        console.log("Creating payment order for booking:", { doctorId, appointmentDate, timeSlot })

        // Get doctor details to calculate fee
        const doctor = await User.findById(doctorId).populate("doctorProfile")
        if (!doctor || !doctor.doctorProfile) {
            return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
        }

        const consultationFee = doctor.doctorProfile.consultationFee

        // Create Razorpay order with appointment data in notes
        const options = {
            amount: consultationFee * 100, // Amount in paise
            currency: "INR",
            receipt: `b_${userId}_${Date.now()}`,
            notes: {
                // Store all appointment data in notes for later use
                patientId: userId,
                doctorId: doctorId,
                appointmentDate: appointmentDate,
                timeSlotStart: timeSlot.startTime,
                timeSlotEnd: timeSlot.endTime,
                consultationType: consultationType,
                symptoms: symptoms,
                patientNotes: patientNotes || "",
                consultationFee: consultationFee
            },
        }
        console.log("receipt", options.receipt)
        const order = await razorpay.orders.create(options)

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                doctorName: doctor.doctorProfile.fullName,
            },
        })
    } catch (error) {
        console.error("Error creating payment order:", error)
        return NextResponse.json({
            success: false,
            message: "Failed to create payment order"
        }, { status: 500 })
    }
}