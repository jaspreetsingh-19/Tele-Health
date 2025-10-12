import { NextResponse } from "next/server"
import connect from "@/lib/db"
import ChatRoom from "@/models/ChatRoom"
import Appointment from "@/models/Appointment"
import { getDataFromToken } from "@/helper/getDataFromToken"

export async function POST(request) {
    try {
        console.log("starting")
        await connect()

        const userId = await getDataFromToken(request)
        const body = await request.json()
        const { appointmentId } = body
        console.log("id", appointmentId)

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        // Get appointment details
        const appointment = await Appointment.findById(appointmentId)
            .populate("patientId", "username email patientProfile avatar")
            .populate("doctorId", "username email doctorProfile avatar")

        if (!appointment) {
            return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
        }

        // Verify user has access to this appointment
        const hasAccess =
            appointment.patientId._id.toString() === userId ||
            appointment.doctorId._id.toString() === userId

        if (!hasAccess) {
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 403 })
        }

        // ✅ CHANGE STARTS HERE — use atomic "findOneAndUpdate" instead of manual check + save
        const roomId = appointment.roomId || `room_${appointmentId}`

        // This will either return the existing room or create one atomically
        const chatRoom = await ChatRoom.findOneAndUpdate(
            { appointmentId }, // find by appointment
            {
                $setOnInsert: {
                    roomId,
                    appointmentId,
                    patientId: appointment.patientId._id,
                    doctorId: appointment.doctorId._id,
                    messages: [],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
            { upsert: true, new: true } // create if not found, return the updated doc
        ).populate([
            { path: "patientId", select: "username email patientProfile avatar" },
            { path: "doctorId", select: "username email doctorProfile avatar" },
        ])
        // ✅ CHANGE ENDS HERE

        // Update appointment with roomId if not already set
        if (!appointment.roomId) {
            appointment.roomId = roomId
            await appointment.save()
        }

        return NextResponse.json({
            success: true,
            chatRoom,
            message: "Chat room ready",
        })
    } catch (error) {
        console.error("Error creating chat room:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create chat room",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500 }
        )
    }
}
