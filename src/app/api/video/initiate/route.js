import VideoCall from "@/models/VideoCall";
import Appointment from "@/models/Appointment";
import connect from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextResponse } from "next/server";


function generateRandom() {
    const randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return randomNumber.toString();
}


export async function POST(request) {
    try {
        await connect();
        console.log("startin initiate")

        const { appointmentId } = await request.json();
        console.log("id", appointmentId)

        if (!appointmentId) {
            return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });
        }

        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Invalid token or user not logged in" }, { status: 401 });
        }

        // Find the appointment
        const appointment = await Appointment.findOne({ appointmentId })
            .populate("patientId", "username avatar")
            .populate("doctorId", "username avatar");
        console.log("appoi", appointment.patientId._id.toString(), userId)
        if (!appointment) {
            console.log("no appoi")
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        // Determine userType
        let userType;
        if (appointment.patientId._id.toString() === userId) {
            userType = "patient";
        } else if (appointment.doctorId._id.toString() === userId) {
            userType = "doctor";
        } else {
            console.log("not auth", userType)
            return NextResponse.json({ error: "You are not part of this appointment" }, { status: 403 });
        }



        // Generate unique identifiers
        let videoCall = await VideoCall.findOne({ appointmentId: appointment._id, isActive: true });

        if (!videoCall) {
            // If no call exists, create a new one
            const callId = uuidv4();


            videoCall = new VideoCall({
                callId,
                appointmentId: appointment._id,
                roomId: appointment.roomId,
                patientId: appointment.patientId._id,
                doctorId: appointment.doctorId._id,
                initiatedBy: userId,
                callStatus: "initiated",
                participants: [
                    {
                        userId: appointment.patientId._id,
                        userType: "patient",
                        isConnected: false
                    },
                    {
                        userId: appointment.doctorId._id,
                        userType: "doctor",
                        isConnected: false
                    }
                ],
                startTime: null,
                isActive: true
            });

            await videoCall.save();

            // Save roomId inside appointment if missing
            if (!appointment.roomId) {
                appointment.roomId = videoCall.roomId;
                await appointment.save();
            }
        }

        // Return existing or newly created call
        return NextResponse.json({
            success: true,
            callId: videoCall.callId,
            roomId: videoCall.roomId,
            userType,
            appointment: {
                appointmentId: appointment.appointmentId,
                patientInfo: {
                    id: appointment.patientId._id,
                    username: appointment.patientId.username,
                    avatar: appointment.patientId.avatar
                },
                doctorInfo: {
                    id: appointment.doctorId._id,
                    username: appointment.doctorId.username,
                    avatar: appointment.doctorId.avatar
                }
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error initiating video call:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
