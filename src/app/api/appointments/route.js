// api/appointments/route.js - Fixed version
import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Appointment from "@/models/Appointment"
import User from "@/models/user"
import DoctorAvailability from "@/models/DoctorAvailability"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { generateRoomId, formatDateForDB } from "@/utils/dateUtils"
import { v4 as uuidv4 } from "uuid"

function generateRoom() {
    const randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return randomNumber;
}

// GET - Fetch appointments for user
export async function GET(request) {
    try {
        await connectDB()
        const userId = await getDataFromToken(request)
        const { searchParams } = new URL(request.url)
        const role = searchParams.get("role") || "patient"
        const status = searchParams.get("status")
        const date = searchParams.get("date")

        const query = {}
        if (role === "doctor") {
            query.doctorId = userId
        } else {
            query.patientId = userId
        }

        if (status) {
            query.status = status
        }

        if (date) {
            // Fix date handling - use proper date range
            const targetDate = new Date(date)
            const startDate = new Date(targetDate)
            startDate.setUTCHours(0, 0, 0, 0)
            const endDate = new Date(targetDate)
            endDate.setUTCHours(23, 59, 59, 999)

            query.appointmentDate = { $gte: startDate, $lte: endDate }
        }

        const appointments = await Appointment.find(query)
            .populate("patientId", "username email patientProfile")
            .populate("doctorId", "username email doctorProfile")
            .sort({ appointmentDate: 1, "timeSlot.startTime": 1 })

        return NextResponse.json({
            success: true,
            appointments,
        })
    } catch (error) {
        console.error("Error fetching appointments:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch appointments" }, { status: 500 })
    }
}

// POST - Create new appointment
export async function POST(request) {
    try {
        await connectDB()
        const userId = await getDataFromToken(request)
        const body = await request.json()

        const { doctorId, appointmentDate, timeSlot, consultationType, symptoms } = body
        console.log("timeslots", timeSlot)

        // Validate required fields
        if (!doctorId || !appointmentDate || !timeSlot || !consultationType || !symptoms) {
            console.log("fill all")
            return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
        }

        // Get doctor details for consultation fee
        const doctor = await User.findById(doctorId)
        if (!doctor || doctor.role !== "doctor") {
            return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })
        }

        // Fix date handling - ensure proper date storage
        const appointmentDateObj = formatDateForDB(appointmentDate)

        // Check if time slot is available
        const availability = await DoctorAvailability.findOne({
            doctorId,
            date: {
                $gte: new Date(appointmentDateObj.getTime() - 86400000), // 1 day before
                $lte: new Date(appointmentDateObj.getTime() + 86400000)  // 1 day after
            },
        })

        if (!availability) {
            console.log("not available")
            return NextResponse.json({ success: false, message: "Doctor not available on this date" }, { status: 400 })
        }

        const slot = availability.timeSlots.find(
            (slot) => slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime,
        )

        if (!slot || slot.isBooked) {
            console.log("no slot")
            return NextResponse.json({ success: false, message: "Time slot not available" }, { status: 400 })
        }

        // Create appointment
        const appointment = new Appointment({
            patientId: userId,
            doctorId,
            appointmentId: uuidv4(),
            appointmentDate: appointmentDateObj,
            timeSlot,
            consultationType,
            symptoms,
            consultationFee: doctor.doctorProfile.consultationFee,
            roomId: generateRoom().toString(),
        })

        await appointment.save()

        // Mark time slot as booked
        slot.isBooked = true
        slot.appointmentId = appointment._id
        await availability.save()

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate("patientId", "username email patientProfile")
            .populate("doctorId", "username email doctorProfile")

        return NextResponse.json({
            success: true,
            message: "Appointment booked successfully",
            appointment: populatedAppointment,
        })
    } catch (error) {
        console.error("Error creating appointment:", error)
        return NextResponse.json({ success: false, message: "Failed to create appointment" }, { status: 500 })
    }
}