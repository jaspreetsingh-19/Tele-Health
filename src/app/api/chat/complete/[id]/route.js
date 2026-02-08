import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import ChatRoom from "@/models/ChatRoom"
import Appointment from "@/models/Appointment"
import { getDataFromToken } from "@/helper/getDataFromToken"

export async function POST(request, { params }) {
    try {
        await connectDB()
        const userId = await getDataFromToken(request)
        const { roomId } = params
        const { prescription, notes } = await request.json()

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const chatRoom = await ChatRoom.findOne({ roomId })

        if (!chatRoom) {
            return NextResponse.json({ success: false, message: "Chat room not found" }, { status: 404 })
        }

        // Only doctor can complete consultation
        if (userId !== chatRoom.doctorId.toString()) {
            return NextResponse.json({ success: false, message: "Only doctor can complete consultation" }, { status: 403 })
        }

        // Update appointment status and add prescription/notes
        const appointment = await Appointment.findById(chatRoom.appointmentId)

        if (!appointment) {
            return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
        }

        appointment.status = 'completed'
        appointment.completedAt = new Date()

        if (prescription) {
            appointment.prescription = prescription
        }

        if (notes) {
            appointment.doctorNotes = notes
        }

        await appointment.save()

        // Mark chat room as inactive
        chatRoom.isActive = false
        chatRoom.completedAt = new Date()
        await chatRoom.save()

        return NextResponse.json({
            success: true,
            message: 'Consultation completed successfully',
            appointment: {
                id: appointment._id,
                status: appointment.status,
                completedAt: appointment.completedAt,
                prescription: appointment.prescription
            }
        })

    } catch (error) {
        console.error('Complete consultation API error:', error)
        return NextResponse.json({
            success: false,
            message: "Failed to complete consultation",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
}