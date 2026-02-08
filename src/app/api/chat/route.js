// src/app/api/chat/route.js
import { NextResponse } from "next/server"
import ChatRoom from "@/models/ChatRoom"
import Appointment from "@/models/Appointment"
import connectDB from "@/lib/db"
import { getDataFromToken } from "@/helper/getDataFromToken"

export async function POST(req) {
    try {
        await connectDB()
        const userId = await getDataFromToken(req)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { appointmentId } = await req.json()

        if (!appointmentId) {
            return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
        }

        // Find the appointment
        const appointment = await Appointment.findById(appointmentId)
            .populate('patientId', 'username patientProfile avatar')
            .populate('doctorId', 'username doctorProfile avatar')

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
        }

        // Check if user has access to this appointment

        const hasAccess = appointment.patientId._id.toString() === userId ||
            appointment.doctorId._id.toString() === userId

        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        // Generate or get existing room ID
        let roomId = appointment.roomId
        if (!roomId) {
            roomId = `chat_${appointmentId}_${Date.now()}`
            appointment.roomId = roomId
            await appointment.save()
        }

        // Find or create chat room
        let chatRoom = await ChatRoom.findOne({ appointmentId })

        if (!chatRoom) {
            chatRoom = new ChatRoom({
                roomId,
                appointmentId,
                patientId: appointment.patientId._id,
                doctorId: appointment.doctorId._id,
                messages: [],
                isActive: true
            })
            await chatRoom.save()
        }

        // Populate the chat room with user details
        await chatRoom.populate([
            { path: "patientId", select: "username patientProfile avatar" },
            { path: "doctorId", select: "username doctorProfile avatar" }
        ])

        return NextResponse.json({
            success: true,
            chatRoom: {
                roomId: chatRoom.roomId,
                appointmentId: chatRoom.appointmentId,
                patient: chatRoom.patientId,
                doctor: chatRoom.doctorId,
                messages: chatRoom.messages.slice(-50), // Last 50 messages
                isActive: chatRoom.isActive
            }
        })

    } catch (error) {
        console.error("Chat API Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        await connectDB()
        const userId = await getDataFromToken(req)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const roomId = searchParams.get('roomId')
        const appointmentId = searchParams.get('appointmentId')

        if (!roomId && !appointmentId) {
            return NextResponse.json({ error: "Room ID or Appointment ID is required" }, { status: 400 })
        }

        let chatRoom
        if (roomId) {
            chatRoom = await ChatRoom.findOne({ roomId })
        } else {
            chatRoom = await ChatRoom.findOne({ appointmentId })
        }

        if (!chatRoom) {
            return NextResponse.json({ error: "Chat room not found" }, { status: 404 })
        }

        // Check access

        const hasAccess = chatRoom.patientId.toString() === userId ||
            chatRoom.doctorId.toString() === userId

        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        await chatRoom.populate([
            { path: "patientId", select: "username patientProfile avatar" },
            { path: "doctorId", select: "username doctorProfile avatar" }
        ])

        return NextResponse.json({
            success: true,
            chatRoom: {
                roomId: chatRoom.roomId,
                appointmentId: chatRoom.appointmentId,
                patient: chatRoom.patientId,
                doctor: chatRoom.doctorId,
                messages: chatRoom.messages,
                isActive: chatRoom.isActive
            }
        })

    } catch (error) {
        console.error("Get Chat API Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}