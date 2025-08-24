// api/doctor-availability/route.js - Fixed version
import { NextResponse } from "next/server"
import connect from "@/lib/db"
import DoctorAvailability from "@/models/DoctorAvailability"
import User from "@/models/user"
import { getDataFromToken } from "@/helper/getDataFromToken"
import { generateTimeSlots, formatDateForDB } from "@/utils/dateUtils"

// GET - Get doctor availability
export async function GET(request) {
    try {
        await connect()
        const { searchParams } = new URL(request.url)
        const doctorId = searchParams.get("doctorId")
        const date = searchParams.get("date")
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        const query = {}
        if (doctorId) {
            query.doctorId = doctorId
        }

        if (date) {
            // Fix date handling for single date queries
            const targetDate = formatDateForDB(date)
            const dayStart = new Date(targetDate)
            dayStart.setUTCHours(0, 0, 0, 0)
            const dayEnd = new Date(targetDate)
            dayEnd.setUTCHours(23, 59, 59, 999)

            query.date = {
                $gte: dayStart,
                $lte: dayEnd
            }
        } else if (startDate && endDate) {
            // Fix date range queries
            const startDateObj = formatDateForDB(startDate)
            const endDateObj = formatDateForDB(endDate)

            query.date = {
                $gte: new Date(startDateObj.setUTCHours(0, 0, 0, 0)),
                $lte: new Date(endDateObj.setUTCHours(23, 59, 59, 999))
            }
        }

        const availability = await DoctorAvailability.find(query)
            .populate("doctorId", "username email doctorProfile")
            .sort({ date: 1 })

        return NextResponse.json({
            success: true,
            availability,
        })
    } catch (error) {
        console.error("Error fetching availability:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch availability" }, { status: 500 })
    }
}

// POST - Create/Update doctor availability
export async function POST(request) {
    try {
        await connect()
        const userId = await getDataFromToken(request)
        const body = await request.json()

        // Verify user is a doctor
        const user = await User.findById(userId)
        if (!user || user.role !== "doctor") {
            return NextResponse.json({ success: false, message: "Only doctors can set availability" }, { status: 403 })
        }

        const { date, isAvailable, startTime, endTime, breakStart, breakEnd, slotDuration } = body

        // Fix date handling for storage
        const targetDate = formatDateForDB(date)

        // Check if availability already exists for this date
        let availability = await DoctorAvailability.findOne({
            doctorId: userId,
            date: {
                $gte: new Date(targetDate.getTime() - 86400000), // 1 day buffer
                $lte: new Date(targetDate.getTime() + 86400000)  // 1 day buffer
            }
        })

        if (availability) {
            // Update existing availability
            availability.date = targetDate // Ensure date is properly set
            availability.isAvailable = isAvailable
            if (isAvailable) {
                availability.timeSlots = generateTimeSlots(
                    startTime || "09:00",
                    endTime || "17:00",
                    slotDuration || 30,
                    breakStart || "13:00",
                    breakEnd || "14:00",
                )
                availability.breakTime = {
                    startTime: breakStart || "13:00",
                    endTime: breakEnd || "14:00",
                }
            } else {
                availability.timeSlots = []
            }
        } else {
            // Create new availability
            availability = new DoctorAvailability({
                doctorId: userId,
                date: targetDate,
                isAvailable,
                timeSlots: isAvailable
                    ? generateTimeSlots(
                        startTime || "09:00",
                        endTime || "17:00",
                        slotDuration || 30,
                        breakStart || "13:00",
                        breakEnd || "14:00",
                    )
                    : [],
                breakTime: {
                    startTime: breakStart || "13:00",
                    endTime: breakEnd || "14:00",
                },
            })
        }

        await availability.save()

        return NextResponse.json({
            success: true,
            message: "Availability updated successfully",
            availability,
        })
    } catch (error) {
        console.error("Error updating availability:", error)
        return NextResponse.json({ success: false, message: "Failed to update availability" }, { status: 500 })
    }
}