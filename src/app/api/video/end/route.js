import VideoCall from "@/models/VideoCall";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectDB();
        const userId = getDataFromToken(request);

        const { callId } = await request.json();

        if (!callId || !userId) {
            return NextResponse.json({
                error: "Missing required fields"
            }, { status: 400 });
        }

        const videoCall = await VideoCall.findOne({ callId });

        if (!videoCall) {
            return NextResponse.json({ error: "Video call not found" }, { status: 404 });
        }

        // Verify user has permission to end call
        const isAuthorized = videoCall.patientId.toString() === userId ||
            videoCall.doctorId.toString() === userId;

        if (!isAuthorized) {
            return NextResponse.json({ error: "Not authorized to end this call" }, { status: 403 });
        }

        // Update call status and end time
        videoCall.callStatus = "ended";
        videoCall.endTime = new Date();
        videoCall.isActive = false;

        // Calculate duration only if call actually started
        if (videoCall.startTime) {
            videoCall.duration = Math.floor((videoCall.endTime - videoCall.startTime) / 1000);
        }

        // Update participants who are still connected
        videoCall.participants.forEach(participant => {
            if (participant.isConnected) {
                participant.leftAt = new Date();
                participant.isConnected = false;
            }
        });

        await videoCall.save();

        return NextResponse.json({
            success: true,
            message: "Call ended successfully",
            duration: videoCall.duration
        });

    } catch (error) {
        console.error("Error ending video call:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}