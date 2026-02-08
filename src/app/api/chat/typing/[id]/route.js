import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import ChatRoom from "@/models/ChatRoom"
import { getDataFromToken } from "@/helper/getDataFromToken"

export async function POST(request, { params }) {
    try {
        await connectDB()
        const userId = await getDataFromToken(request)
        const { roomId } = params
        const { isTyping } = await request.json()

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

        // Here you would typically emit a socket event for real-time typing indicators
        // For now, just return success

        return NextResponse.json({
            success: true,
            message: isTyping ? 'Typing started' : 'Typing stopped'
        })

    } catch (error) {
        console.error('Typing API error:', error)
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
}
