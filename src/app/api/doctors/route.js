import { NextResponse } from "next/server"
import connect from "@/lib/db"
import User from "@/models/user"

// GET - Get all approved doctors
export async function GET(request) {
    try {
        await connect()
        const { searchParams } = new URL(request.url)
        const specialization = searchParams.get("specialization")
        const search = searchParams.get("search")

        const query = {
            role: "doctor",
            "doctorProfile.isApproved": true,
            "doctorProfile.isAvailableForConsultation": true,
        }

        if (specialization) {
            query["doctorProfile.specialization"] = { $in: [specialization] }
        }

        if (search) {
            query.$or = [
                { "doctorProfile.fullName": { $regex: search, $options: "i" } },
                { "doctorProfile.specialization": { $regex: search, $options: "i" } },
            ]
        }

        const doctors = await User.find(query).select("username email doctorProfile avatar createdAt")

        return NextResponse.json({
            success: true,
            doctors,
        })
    } catch (error) {
        console.error("Error fetching doctors:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch doctors" }, { status: 500 })
    }
}
