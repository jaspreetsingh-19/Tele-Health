import { NextResponse } from "next/server"
import connect from "@/lib/db"
import Appointment from "@/models/Appointment"
import DoctorAvailability from "@/models/DoctorAvailability"
import { getDataFromToken } from "@/helper/getDataFromToken"

// GET - Get specific appointment
export async function GET(request, { params }) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { id } = params

        const appointment = await Appointment.findById(id)
            .populate("patientId", "username email patientProfile")
            .populate("doctorId", "username email doctorProfile")

        if (!appointment) {
            return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
        }

        // Check if user has access to this appointment
        if (appointment.patientId._id.toString() !== userId && appointment.doctorId._id.toString() !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 403 })
        }

        return NextResponse.json({
            success: true,
            appointment,
        })
    } catch (error) {
        console.error("Error fetching appointment:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch appointment" }, { status: 500 })
    }
}

// PUT - Update appointment
export async function PUT(request, { params }) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { id } = params
        const body = await request.json()

        const appointment = await Appointment.findById(id)
        if (!appointment) {
            return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
        }

        // Check authorization
        if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 403 })
        }

        // Update appointment
        const updatedAppointment = await Appointment.findByIdAndUpdate(id, body, {
            new: true,
        })
            .populate("patientId", "username email patientProfile")
            .populate("doctorId", "username email doctorProfile")

        return NextResponse.json({
            success: true,
            message: "Appointment updated successfully",
            appointment: updatedAppointment,
        })
    } catch (error) {
        console.error("Error updating appointment:", error)
        return NextResponse.json({ success: false, message: "Failed to update appointment" }, { status: 500 })
    }
}

// DELETE - Cancel appointment
export async function DELETE(request, { params }) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const { id } = params

        const appointment = await Appointment.findById(id)
        if (!appointment) {
            return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 })
        }

        // Check authorization
        if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 403 })
        }

        // Update appointment status to cancelled
        appointment.status = "cancelled"
        await appointment.save()

        // Free up the time slot
        const appointmentDate = new Date(appointment.appointmentDate)
        appointmentDate.setHours(0, 0, 0, 0)

        const availability = await DoctorAvailability.findOne({
            doctorId: appointment.doctorId,
            date: appointmentDate,
        })

        if (availability) {
            const slot = availability.timeSlots.find(
                (slot) => slot.startTime === appointment.timeSlot.startTime && slot.endTime === appointment.timeSlot.endTime,
            )
            if (slot) {
                slot.isBooked = false
                // slot.appointmentId = null
                await availability.save()
            }
        }

        return NextResponse.json({
            success: true,
            message: "Appointment cancelled successfully",
        })
    } catch (error) {
        console.error("Error cancelling appointment:", error)
        return NextResponse.json({ success: false, message: "Failed to cancel appointment" }, { status: 500 })
    }
}
