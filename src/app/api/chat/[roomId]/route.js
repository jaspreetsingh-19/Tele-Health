import { NextResponse } from "next/server"
import connect from "@/lib/db"
import ChatRoom from "@/models/ChatRoom"
import User from "@/models/user"
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
                { path: "patientId", select: "username email patientProfile avatar" },
                { path: "doctorId", select: "username email doctorProfile avatar" },
                { path: "messages.senderId", select: "username email patientProfile doctorProfile" }
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

        // Mark messages as read for the current user
        const userRole = userId === chatRoom.doctorId._id.toString() ? 'doctor' : 'patient'
        const unreadMessages = chatRoom.messages.filter(msg =>
            msg.senderType !== userRole && !msg.isRead
        )

        if (unreadMessages.length > 0) {
            unreadMessages.forEach(msg => {
                msg.isRead = true
                msg.readAt = new Date()
            })
            await chatRoom.save()
        }

        return NextResponse.json({
            success: true,
            messages: chatRoom.messages,
            participants: {
                patient: chatRoom.patientId,
                doctor: chatRoom.doctorId
            },
            roomInfo: {
                roomId: chatRoom.roomId,
                isActive: chatRoom.isActive,
                createdAt: chatRoom.createdAt
            }
        })

    } catch (error) {
        console.error('Messages GET API error:', error)
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
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

        const { message, messageType = 'text', attachments = [] } = body

        if (!message || !message.trim()) {
            return NextResponse.json({ success: false, message: "Message content is required" }, { status: 400 })
        }

        const chatRoom = await ChatRoom.findOne({ roomId })
            .populate([
                { path: "patientId", select: "username email patientProfile avatar" },
                { path: "doctorId", select: "username email doctorProfile avatar" }
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

        // Determine sender type and info
        const senderType = userId === chatRoom.doctorId._id.toString() ? 'doctor' : 'patient'
        const senderInfo = senderType === 'doctor' ? chatRoom.doctorId : chatRoom.patientId

        const newMessage = {
            senderId: userId,
            senderType,
            message: message.trim(),
            messageType,
            attachments,
            timestamp: new Date(),
            isRead: false,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        chatRoom.messages.push(newMessage)
        chatRoom.updatedAt = new Date()
        await chatRoom.save()

        // Get the saved message with populated sender info
        const savedMessage = {
            ...newMessage,
            senderInfo: {
                username: senderInfo.username,
                fullName: senderType === 'doctor'
                    ? senderInfo.doctorProfile?.fullName
                    : senderInfo.patientProfile?.fullName,
                avatar: senderInfo.avatar
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
            savedMessage,
            messageId: newMessage.messageId
        })

    } catch (error) {
        console.error('Messages POST API error:', error)
        return NextResponse.json({
            success: false,
            message: "Failed to send message",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
}