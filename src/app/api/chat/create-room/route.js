import { NextResponse } from "next/server"
import connect from "@/lib/db"
import ChatRoom from "@/models/ChatRoom"
import Appointment from "@/models/Appointment"
import { getDataFromToken } from "@/helper/getDataFromToken"

export async function POST(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const body = await request.json()
        const { appointmentId } = body

        // Get appointment details
        const appointment = await Appointment.findById(appointmentId)
            .populate("patientId", "username email patientProfile")
            .populate("doctorId", "username email doctorProfile")

        if (!appointment) {
            return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
        }

        // Verify user has access to this appointment
        if (appointment.patientId._id.toString() !== userId && appointment.doctorId._id.toString() !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 403 })
        }

        // Check if chat room already exists
        let chatRoom = await ChatRoom.findOne({ appointmentId })

        if (!chatRoom) {
            // Create new chat room
            chatRoom = new ChatRoom({
                roomId: appointment.roomId || `room_${appointmentId}`,
                appointmentId,
                patientId: appointment.patientId._id,
                doctorId: appointment.doctorId._id,
                messages: [],
                isActive: true,
            })

            await chatRoom.save()

            // Update appointment with roomId if not exists
            if (!appointment.roomId) {
                appointment.roomId = chatRoom.roomId
                await appointment.save()
            }
        }

        // Populate the chat room with user details
        await chatRoom.populate([
            { path: "patientId", select: "username email patientProfile" },
            { path: "doctorId", select: "username email doctorProfile" }
        ])

        return NextResponse.json({
            success: true,
            chatRoom,
        })
    } catch (error) {
        console.error("Error creating chat room:", error)
        return NextResponse.json({ success: false, message: "Failed to create chat room" }, { status: 500 })
    }
}