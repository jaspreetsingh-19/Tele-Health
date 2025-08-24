import { NextResponse } from "next/server"
import connect from "@/lib/db"
import ChatRoom from "@/models/ChatRoom"
import { getDataFromToken } from "@/helper/getDataFromToken"

export async function GET(request, { params }) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { roomId } = params

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const chatRoom = await ChatRoom.findOne({ roomId })
            .populate([
                { path: "patientId", select: "username email patientProfile" },
                { path: "doctorId", select: "username email doctorProfile" },
                { path: "messages.senderId", select: "username email" }
            ])

        if (!chatRoom) {
            return NextResponse.json({ success: false, message: "Chat room not found" }, { status: 404 })
        }

        // Verify access
        const hasAccess = userId === chatRoom.patientId._id.toString() ||
            userId === chatRoom.doctorId._id.toString()

        if (!hasAccess) {
            return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 })
        }

        return NextResponse.json({
            success: true,
            messages: chatRoom.messages,
            participants: {
                patient: chatRoom.patientId,
                doctor: chatRoom.doctorId
            }
        })

    } catch (error) {
        console.error('Messages API error:', error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request, { params }) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { roomId } = params
        const body = await request.json()

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const chatRoom = await ChatRoom.findOne({ roomId })
        if (!chatRoom) {
            return NextResponse.json({ success: false, message: "Chat room not found" }, { status: 404 })
        }

        // Verify access
        const hasAccess = userId === chatRoom.patientId.toString() ||
            userId === chatRoom.doctorId.toString()

        if (!hasAccess) {
            return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 })
        }

        const { message, messageType = 'text' } = body

        const senderType = userId === chatRoom.doctorId.toString() ? 'doctor' : 'patient'

        const newMessage = {
            senderId: userId,
            senderType,
            message,
            messageType,
            timestamp: new Date(),
            isRead: false
        }

        chatRoom.messages.push(newMessage)
        await chatRoom.save()

        // Return the saved message with sender info
        const savedMessage = chatRoom.messages[chatRoom.messages.length - 1]

        return NextResponse.json({
            success: true,
            message: 'Message saved',
            savedMessage
        })

    } catch (error) {
        console.error('Messages API error:', error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}