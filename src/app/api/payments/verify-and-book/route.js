import { NextResponse } from "next/server"
import crypto from "crypto"
import connectDB from "@/lib/db"
import Appointment from "@/models/Appointment"
import Razorpay from "razorpay"
import ChatRoom from "@/models/ChatRoom"
import { getDataFromToken } from "@/helper/getDataFromToken"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})
function generateRoom() {
    const randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return randomNumber.toString();
}

export async function POST(request) {
    try {
        await connectDB()
        const userId = await getDataFromToken(request)
        const body = await request.json()

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = body
        console.log("id", appointmentId)

        // Step 1: Verify payment signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex")

        if (razorpay_signature !== expectedSign) {
            return NextResponse.json({
                success: false,
                message: "Invalid payment signature"
            }, { status: 400 })
        }

        // Step 2: Get order details from Razorpay to retrieve appointment data
        const order = await razorpay.orders.fetch(razorpay_order_id)

        if (!order || !order.notes) {
            return NextResponse.json({
                success: false,
                message: "Order data not found"
            }, { status: 404 })
        }

        // Step 3: Verify user authorization
        if (order.notes.patientId !== userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized access"
            }, { status: 403 })
        }

        // Step 4: Check if appointment already exists for this payment
        const existingAppointment = await Appointment.findOne({
            razorpayOrderId: razorpay_order_id
        })

        if (existingAppointment) {
            return NextResponse.json({
                success: false,
                message: "Appointment already created for this payment"
            }, { status: 400 })
        }

        // Step 5: Generate room ID for video consultations
        const roomId = order.notes.consultationType === "video"
            ? `room_${userId}_${generateRoom()}`
            : null

        // Step 6: Create appointment ONLY after successful payment verification
        const appointmentData = {
            patientId: order.notes.patientId,
            doctorId: order.notes.doctorId,
            appointmentDate: order.notes.appointmentDate,
            timeSlot: {
                startTime: order.notes.timeSlotStart,
                endTime: order.notes.timeSlotEnd
            },
            consultationType: order.notes.consultationType,
            symptoms: order.notes.symptoms,
            patientNotes: order.notes.patientNotes,
            consultationFee: parseFloat(order.notes.consultationFee),
            paymentStatus: "paid",
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            status: "scheduled",
            roomId: roomId
        }

        const appointment = new Appointment(appointmentData)
        await appointment.save()

        if (order.notes.consultationType === "video") {
            await ChatRoom.create({
                roomId,

                patientId: order.notes.patientId,
                doctorId: order.notes.doctorId,
                messages: [],
                isActive: true
            });
        }

        console.log("Appointment created successfully:", appointment._id)

        return NextResponse.json({
            success: true,
            message: "Payment verified and appointment created successfully",
            appointment: {
                id: appointment._id,
                appointmentDate: appointment.appointmentDate,
                timeSlot: appointment.timeSlot,
                status: appointment.status,
                roomId: appointment.roomId
            }
        })

    } catch (error) {
        console.error("Error in verify-and-book:", error)

        // If appointment creation fails after payment, you might want to log this
        // for manual intervention or implement a retry mechanism
        return NextResponse.json({
            success: false,
            message: "Payment verified but appointment creation failed. Please contact support."
        }, { status: 500 })
    }
}